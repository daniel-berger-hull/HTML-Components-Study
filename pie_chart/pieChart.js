
// calculate portion of the Pie Chart for a sement
//   Based on number of segment and value of this specific segement


// ***  March 31, 2023
// The Pie Chart is pretty much fonctionnal, as you can provide date as parameter (in the the HTML) and it will display 
// most of the time the distribution correctly (some glitche dough)
//
// The CSS Poligon clipping is not very elegent, as I did not find a correct analytical way to correctly calculated
// the polygon to be used a clip. I used a box as template for coordiates around the pie chart (see boxCoords array below)
// It split a full rotation over the pie chart (who appears to the user a circle) in 40 section (so instead of 360 deg, I have 40 angles)

// To Do
// =======
//  1 -  Add DIV in Component
//  Should add as many div sections in the Web Component as the number of params passed to the control
//    For instance, the component will handle up to 3 values to display, but after that, gray on the background start to app
//
//  2 - CSS Configuration of DIV most efficient
//   The config on the CSS of the DIV method connectedCallback()  as pretty much all hard coded
//   Add flexibity, especiall if a variable number of data (so DIV section required in the PIE-Chart) will be passed and displayed to the users
//
//  3 - More params to be passed to the Web Component?
//  So far, only width, heigth and data can be passed from the HTML, could more be required?


const MAXIMUM_VALUES            = 50;
const MAXIMUM_VALUE_RANGE       = 1000;


const DEFAULT_COMPONENT_WIDTH   = 300;
const DEFAULT_COMPONENT_HEIGHT  = 300;

    

const boxCoords = [  [1.0 , 0.0], [0.9 , 0.0], [0.8 , 0.0], [0.7 , 0.0], [0.6 , 0.0], [0.5 , 0.0], [0.4 , 0.0], [0.3 , 0.0], [0.2 , 0.0], [0.1 , 0.0],
                     [0.0 , 0.0], [0.0 , 0.1], [0.0 , 0.2], [0.0 , 0.3], [0.0 , 0.4], [0.0 , 0.5], [0.0 , 0.6], [0.0 , 0.7], [0.0 , 0.8], [0.0 , 0.9],
                     [0.0 , 1.0], [0.1 , 1.0], [0.2 , 1.0], [0.3 , 1.0], [0.4 , 1.0], [0.5 , 1.0], [0.6 , 1.0], [0.7 , 1.0], [0.8 , 1.0], [0.9 , 1.0],
                     [1.0 , 1.0], [1.0 , 0.9], [1.0 , 0.8], [1.0 , 0.7], [1.0 , 0.6], [1.0 , 0.5], [1.0 , 0.4], [1.0 , 0.3], [1.0 , 0.2], [1.0 , 0.1], 
                     [1.0 , 0.0], [0.9 , 0.0], [0.8 , 0.0], [0.7 , 0.0], [0.6 , 0.0], [0.5 , 0.0], [0.4 , 0.0], [0.3 , 0.0], [0.2 , 0.0], [0.1 , 0.0]   
                      // Should only have 4 lines in this array, but since there are overshoot sometime in the process method, we can query for index of 39 some time... 
        ]; 

class PieChartHelper {

    
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

    // General Process
    // 1 - Get the sum of all the values
    // 2 - Get the ratio of a value in regards to the sum of all values (step 1)
    // 3 - Get the angle ratio of a value (how wide a segment will be depend on its value)
    // 4 - Get the location on the outside circle, where this angle ratio will be
    process (width, height) {
        

        this.results = [];
        this.segments = [];     // This is where the final coords to draw the segment on the pie chart will end up..
        this.innerBox = { width: width, height: height};    // This is the square box that been used to calculate all the coords in the array 'results'
        let angleAccumulator = 0;


        // The sum of the arrays can be given by the special array function 'reduce'
        const sumValues = this.values.reduce(  (accumulator, currentValue) => accumulator + currentValue, 0);


        // the first coords is a given: It is always the start of the circle (which I put at the top right corner)...
        let startBoxCoords = this.getBoxCoords(angleAccumulator, width, height);
        let startLine =  { id : 0,
                            value : 0 ,  
                            angle: 0,
                            subAngles : 0,
                            accumulatedAngle: angleAccumulator,
                            endX : startBoxCoords.x, 
                            endY : startBoxCoords.y };
        this.results.push(startLine);


        for (let i=0;i<this.values.length;i++) {

            let newSegment = [];

            // A) Start with the center of the circle --> Any segments start at this point...
            newSegment.push({ id : i,
                            value : 0 ,  
                            angle: 0,
                            subAngles : 0,
                            accumulatedAngle: 0,
                            endX : width/2, 
                            endY : height/2 });

            // B) Then add the line we got from the previous iteration (the value before in the source array of value)
            newSegment.push(startLine);

            /////////////////////////

            // C) Finally, you have to calculate the last (one or more) lines in the segment...
            let currentRatios    = this.calculateRatios( this.values[i], sumValues, angleAccumulator );
            let nbrPointsToAdd = currentRatios.angle>10 ? Math.round( currentRatios.angle / 5 ) : 1;
            let subAngles = nbrPointsToAdd > 1 ? Math.round(currentRatios.angle / nbrPointsToAdd) :  currentRatios.angle;          // If there are more than one lines to add in the segment, you must use framction of the angle
           
            let j = 0;
            let nextResult;
            do {
                // console.log(`id:${i} -Part:${j} with value(s)  ${currentRatios.value} angle of ${currentRatios.angle}, will need ${nbrPointsToAdd} lines, with ${subAngles} deg`);
                j++;

                angleAccumulator += subAngles;
                angleAccumulator = angleAccumulator>40 ? 40 : angleAccumulator;     // Cast the angle, in case of overshoot at the end of the last segment(s)
                let  boxCoords     = this.getBoxCoords(angleAccumulator, width, height);
             
                nextResult = {  id: i,      
                                    value : this.values[i]   ,                        // id: not necessary but handy for debugging
                                    angle: currentRatios.angle,
                                    subAngles : subAngles,
                                    accumulatedAngle: angleAccumulator,                // accumulatedAngle: Usefull to find where on the circle (angle) where are
                                    endX : boxCoords.x,                             // X Coords fund
                                    endY : boxCoords.y                             // Y Coords fund
                }; 
                this.results.push(  nextResult );
                newSegment.push(nextResult);

            } while (j < nbrPointsToAdd);


            startLine = nextResult;
            this.segments.push(newSegment);
          
        }

    }

    
    calculateRatios(currentValue, sum, angleAccumulator) {

        const ratio = currentValue / sum;
        const angle =  Math.round( ratio * 40 );
        
        angleAccumulator += angle;

        return { value: currentValue, 
                 ratio: ratio, 
                 angle: angle, 
                 angleAccumulator: angleAccumulator };
    }

    getBoxCoords(angleAccumulator,boxWidth,boxHeight) {
            
        return { x : Math.floor( boxCoords[angleAccumulator][0] * boxWidth ),
                 y : Math.floor( boxCoords[angleAccumulator][1] * boxHeight )
        };
     }


    toString(pointInfo){

        let clipString = "";

        pointInfo.forEach( point => {
            //console.log(`\t${point.endX} , ${point.endY}`)

            //clipString.concat(`${point.endX}px ${point.endY}px,`);

            clipString += `${point.endX}px ${point.endY}px, `;

        });

        let result = clipString.lastIndexOf(",");
        let corrected = clipString.substr(0, result);

        return corrected;
    }


    render(canvas) {


        var context = canvas.getContext('2d');
    
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var radius = 150;
    
        var marginX = (canvas.width - this.innerBox.width) / 2;
        var marginY = (canvas.height - this.innerBox.height) / 2;
        

        context.fillStyle = 'gray';
        context.fillRect(0, 0, canvas.width, canvas.height);


        // Draw the Pie Chart Background...
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = 'red';
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = '#00ff00';
        context.stroke();



       

        const colors = [ '#000000' , '#ffffff' ,'#00ff00' , '#0000ff', '#00ffff', '#808080' , '#ff8000'];

        // For each points fund on the circle (process method), draw a line 
        // from the center of the circle up to the coords calculated (inside the element variable)
        this.results.forEach( (element,index) => {  
                context.strokeStyle = colors[element.id];
                
                context.beginPath();
                context.moveTo(centerX, centerY);
                context.lineTo(marginX + element.endX, 
                               marginY + element.endY);
                context.stroke();
        });       


        // this.results.forEach( (element,index) => {  console.log(index + " " + JSON.stringify(element)  + " of color " + colors[element.id]  )});this.results.forEach( (element,index) => {  console.log(index + " " + JSON.stringify(element)  + " of color " + colors[element.id]  )});
    }

}

class PieChart extends HTMLElement {
    
    
    connectedCallback() {

        this.width = this.hasAttribute('width') ? this.getAttribute('width') : DEFAULT_COMPONENT_WIDTH;
        this.height = this.hasAttribute('height') ? this.getAttribute('height') : DEFAULT_COMPONENT_HEIGHT;
        

        console.log( `Component size [${this.width},${this.height}]`);

        console.log( `Data param is Component  [${this.getAttribute('data')}]`);

        
        if ( this.hasAttribute("data") ) {

            this.data = [];
            const splited = this.getAttribute('data').split(",");


            splited.forEach(element=>{ this.data.push( parseInt(element) )  });

            console.log('Data size: ' + this.data.length + " -->" + this.data );
        } else
            console.log('No data provided to the PieChart Component!');
        



        this.helper = new PieChartHelper( this.data );
        this.helper.process( this.width,this.height );

        for (let i=0;i<this.helper.segments.length;i++){
            console.log( `${i} + ${this.helper.toString(this.helper.segments[i])}` );    
        };


        this.innerHTML = `
        <div class="container">
            <div class="section-1"></div>
            <div class="section-2"></div>
            <div class="section-3"></div>
        </div> `;

        let blueSegment = {
            segmentName: '.section-1',
            color: 'blue',
            // clipPath : '0 0, 50% 0, 50% 50%, 0 100%'
            // clipPath : '0px 0px, 150px 0px, 150px 150px, 0px 300px'
            clipPath :  `${this.helper.toString(this.helper.segments[0])}`
        }

        let redSegment = {
            segmentName: '.section-2',
            color: 'red',
            // clipPath : '50% 0, 100% 0%, 100% 100%, 50% 50%'
            clipPath :  `${this.helper.toString(this.helper.segments[1])}`
        }

        let greenSegment = {
            segmentName: '.section-3',
            color: 'green',
            // clipPath : '50% 50%, 100% 100%, 0 100%'
            clipPath :  `${this.helper.toString(this.helper.segments[2])}`
            
        }

        let blackSegment = {
            segmentName: '.section-4',
            color: 'black',
            clipPath : '50% 50%, 100% 100%, 0 100%'
        }



        this.configContainerCSS();
        this.configSegmentCSS(blueSegment);
        this.configSegmentCSS(redSegment);
        this.configSegmentCSS(greenSegment);
        
        
       
  
    }


    // Set the CSS for the container in the backgroud of the PieChart control
    configContainerCSS() {

        this.querySelector('.container').style.position = 'relative';
        this.querySelector('.container').style.width = '300px';
        this.querySelector('.container').style.height = '300px';
        this.querySelector('.container').style.overflow = 'hidden';
        this.querySelector('.container').style.backgroundColor = 'hidden';
        this.querySelector('.container').style.backgroundColor = 'gray';    
        this.querySelector('.container').style.clipPath = 'circle(50%)';    
        
    }

    // Set the CSS for one specific portion in the PieChart
    // Info like sub section name, its color, but also the exact position to mask
    // in order to render this specific portion (segment) of the pie chart
    // has to be precalculated, before calling this method..
    configSegmentCSS(segmentInfo) {

        this.querySelector( segmentInfo.segmentName ).style.position = 'absolute';
        this.querySelector( segmentInfo.segmentName ).style.width    = '100%';
        this.querySelector( segmentInfo.segmentName ).style.height   = '100%';
        this.querySelector( segmentInfo.segmentName ).style.top      = '0px';
        this.querySelector( segmentInfo.segmentName ).style.left     = '0px';
        
        this.querySelector( segmentInfo.segmentName ).style.backgroundColor = segmentInfo.color;
        this.querySelector( segmentInfo.segmentName ).style.clipPath = `polygon(${segmentInfo.clipPath})`;        
    }
}




// let helper = PieChartHelper;
// let helper2 = new PieChartHelper();
// let helper3 = new PieChartHelper([]);
// let helper4 = new PieChartHelper([1,5,3]);
// let helper5 = new PieChartHelper([1,-5,3]);
// let helper6 = new PieChartHelper([1,'a',3]);



const testDrawing = (canvasID) => {
    console.log('testDrawing');


    // let helper5 = new PieChartHelper([6,5,9,7]);
     var canvas = document.getElementById(canvasID);
   
    // helper5.process(150);
    // helper5.render(canvas);


    this.helper = new PieChartHelper([2,9,1,5]);
       
    this.helper.process(300,300);
    this.helper.render(canvas);


    this.helper.segments.forEach( (element,index) => {  
        console.log( `${index} + ${this.helper.toString(element)}` );
    });
}



//  ** To Debug, use this method below
//  testDrawing();


customElements.define('pie-chart', PieChart);