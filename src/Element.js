import React from 'react';

import "./Element.css"


export default function Element(props) {
    return (
        <div className="element">
            <h5>{props.id}</h5>
            <h5>{props.symbol}</h5>
            <p>{props.name}</p>
            <p>{props.weight}</p>
        </div>
    );
}