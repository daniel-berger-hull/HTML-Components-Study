
// Note: There is a cycle in the depdencies of graphbar.js and  graphbarhelper.js and this is not very desirable...
import {  MAXIMUM_VALUES, MAXIMUM_VALUE_RANGE,         
          DEFAULT_COMPONENT_WIDTH, DEFAULT_COMPONENT_HEIGHT, 
          DEFAULT_BAR_HEIGHT         } from './graphbar.js';

import {  Bar } from './graphbar.js';




export class GraphBarHelper {

    
    constructor(values) {

        if ( !this.isValidValueSet(values))  return;

        //console.log('Set ' + values + ' is valid ');
        
        this.values = values;
        this.nbrSegment = values.length;
    }

    isValidValueSet(values) {

        if (typeof values === 'undefined') return false;
        if (values.length === 0) return false;
        if (values.length >= MAXIMUM_VALUES) return false;
        

        // I tried to use a forEach() or every() function to loop through the array, but for
        // some reason, it skips always after the first value is read ... 
        // I used a less elegent classic for loop then...
        for (let i=0;i<values.length;i++) {
        
            if (!Number.isInteger(values[i]) || 
                values[i]<= 0 ||
                values[i] > MAXIMUM_VALUE_RANGE ){

                console.log(i + ' Not a value integer');
                return false;
            }  
        }
  
        return true;
    }

    //Steps
    // 1 - Get the max values
    // 2 - Calculate the ratio or each value versus the max (so that each values can be draw with a bar linear to the max value)
    // 3 - Calculate the actual lenght of each bar, for each values
    //  Object (for each value to draw):  Value, ratio, height, width (optionnal), color (optionnal)
    process (width, height) {
        

        this.innerBox = { width: width, height: height};    // This is the square box that been used to calculate all the coords in the array 'results'
        this.allBars = [];

       

        const maxValue = Math.max(...this.values);
        
        for (let i=0;i<this.values.length;i++) {

            let nextBar = new Bar(this.values[i]);
            nextBar.setRatio(maxValue);
            nextBar.setHeight(this.innerBox.height);

            this.allBars.push(nextBar);
        }

    }

    
    toString(pointInfo){

        let clipString = "";

        pointInfo.forEach( point => {

            clipString += `${point.endX}px ${point.endY}px, `;
        });

        let result = clipString.lastIndexOf(",");
        let corrected = clipString.substr(0, result);

        return corrected;
    }

}