import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Parser() {
	const [value, setValue] = useState("");
	const [displayValue, setDisplayValue] = useState("");
	const [molarMass, setMolarMass] = useState(0);
	const [Reactants, setReactants] = useState([]);
	const [Products, setProducts] = useState([]);
	const [dbAtomData, setDBAtomData] = useState([]);
	const [reactantAtoms, setReactantAtoms] = useState([]);
	const [productAtoms, setProductAtoms] = useState([]);
	const [reactantAtomString, setReactantAtomString] = useState([]);
	const [productAtomString, setProductAtomString] = useState([]);

	useEffect(() => {
		axios({
			method: "post",
			url: "http://127.0.0.1:5000/getAtoms",

			data: {
				atoms_data: reactantAtomString,
			},
		})
			.then((response) => {
				setDBAtomData(response.data);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [reactantAtomString]);

	function onChange(event) {
		setValue(event.target.value);
	}

	useEffect(() => {
		if (dbAtomData.length > 0 && reactantAtoms.length > 0) {
			getMolarMass();
		}
	});

	function onSubmit(event) {
		event.preventDefault();
		setDisplayValue(value);
		InitReaction(value);
	}

	function getMolarMass() {
		let molarMass = 0;

		for (let i = 0; i < reactantAtoms.length; i++) {
			for (let j = 0; j < dbAtomData.length; j++) {
				if (reactantAtoms[i].atom == dbAtomData[j].symbol) {
					molarMass +=
						reactantAtoms[i].molecule_quantity *
						reactantAtoms[i].atom_quantity *
						dbAtomData[j].weight;
				}
			}
		}

		setMolarMass(molarMass);
	}

	let molarMassString;

	async function InitReaction(formula) {
		let regex_reaction = /[^\s\-\>]+/g;
		let regex_compounds = /[^\+\s]+/g;
		let regex_atoms = /(([0-9]+)?[A-Z][a-z]?[0-9]?)/g;

		let reaction = [...formula.matchAll(regex_reaction)];
		let reaction_ = [];

		for (let i = 0; i < reaction.length; i++) {
			reaction_.push(reaction[i][0]);
		}

		let reaction_string = reaction[0] + " -> " + reaction[1];

		let reactants = [];
		let products = [];

		for (let i = 0; i < reaction.length; i++) {
			let compounds = [...reaction_[i].matchAll(regex_compounds)];
			let compounds_ = [];

			for (let j = 0; j < compounds.length; j++) {
				if (/^\d+/.test(compounds[j][0])) {
					let num = compounds[j][0].match(/^\d+/);
					let comp = compounds[j][0].match(/([A-Z]).*/);

					compounds_.push({
						molecule: comp[0],
						molecule_quantity: parseInt(num),
					});
				} else {
					compounds_.push({
						molecule: compounds[j][0],
						molecule_quantity: 1,
					});
				}
			}

			if (i == 0) {
				reactants = compounds_;
			} else if (i == 1) {
				products = compounds_;
			}
		}

		let reactants_atoms = [];
		let products_atoms = [];

		for (let i = 0; i < reactants.length; i++) {
			let atoms = [...reactants[i].molecule.matchAll(regex_atoms)];

			for (let j = 0; j < atoms.length; j++) {
				if (/[A-Za-z]+\d+/g.test(atoms[j][0])) {
					let amount = atoms[j][0].match(/\d+/g);
					let atom = atoms[j][0].match(/[A-Za-z]+/g);

					reactants_atoms.push({
						id: i,
						molecule_index: i,
						molecule: reactants[i].molecule,
						molecule_quantity: reactants[i].molecule_quantity,
						atom: atom[0],
						atom_quantity: parseInt(amount[0]),
					});
				} else {
					reactants_atoms.push({
						id: i,
						molecule_index: i,
						molecule: reactants[i].molecule,
						molecule_quantity: reactants[i].molecule_quantity,
						atom: atoms[j][0],
						atom_quantity: 1,
					});
				}
			}
		}

		for (let i = 0; i < products.length; i++) {
			let atoms = [...products[i].molecule.matchAll(regex_atoms)];

			for (let j = 0; j < atoms.length; j++) {
				if (/[A-Za-z]+\d+/g.test(atoms[j][0])) {
					let amount = atoms[j][0].match(/\d+/g);
					let atom = atoms[j][0].match(/[A-Za-z]+/g);

					products_atoms.push({
						id: i,
						molecule_index: i + reactants.length,
						molecule: products[i].molecule,
						molecule_quantity: products[i].molecule_quantity,
						atom: atom[0],
						atom_quantity: parseInt(amount[0]),
					});
				} else {
					products_atoms.push({
						id: i,
						molecule_index: i + reactants.length,
						molecule: products[i].molecule,
						molecule_quantity: products[i].molecule_quantity,
						atom: atoms[j][0],
						atom_quantity: 1,
					});
				}
			}
		}

		let reactant_atoms_array = [];
		let product_atoms_array = [];

		setReactants(reactants);
		setProducts(products);
		setReactantAtoms(reactants_atoms);
		setProductAtoms(products_atoms);

		for (let i = 0; i < reactants_atoms.length; i++) {
			//console.log(reactantAtoms[i].atom);
			reactant_atoms_array.push(reactants_atoms[i].atom);
		}

		for (let i = 0; i < products_atoms.length; i++) {
			product_atoms_array.push(products_atoms[i].atom);
		}

		//console.log(reactantAtoms);

		setReactantAtomString(reactant_atoms_array);
		setProductAtomString(product_atoms_array);

		const results = await axios({
			method: "post",
			url: "http://192.168.1.11:5000/getAtoms",

			data: {
				atoms_data: reactant_atoms_array,
			},
		});

		setDBAtomData(results.data);
	}

	if (displayValue && molarMass) {
		molarMassString = (
			<p>
				M({displayValue}) = {molarMass} g/mol
			</p>
		);
	}

	return (
		<div>
			<div>
				<h2>Chemparser</h2>
				<form onSubmit={onSubmit}>
					<input type="text" value={value} onChange={onChange} />
					<input type="submit" value="Submit" />
				</form>
				{molarMassString}
			</div>

			<div>
				<h5>Test til Reload</h5>
				<ul>
					<li>Skriv: H (Forventet output = 1.008 g/mol)</li>
					<li>Skriv: CO2 (Forventet output = 44.009 g/mol)</li>
					<li>
						(Forventet output = 129.095 g/mol) Skriv: C4H5N2O3
					</li>
					<li>
						(Forventet output = 258.19 g/mol) Skriv: 2C4H5N2O3
					</li>
				</ul>
			</div>
		</div>
	);
}
