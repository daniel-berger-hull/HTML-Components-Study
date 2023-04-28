


export const MAXIMUM_VALUES            = 50;
export const MAXIMUM_VALUE_RANGE       = 1000;

export const DEFAULT_COMPONENT_WIDTH   = 300;
export const DEFAULT_COMPONENT_HEIGHT  = 300;
export const DEFAULT_BAR_HEIGHT        = 280;



export const BAR_MAIN_COLOR        = '#0000f0';
export const BAR_BORDER_COLOR      = '#00f0f0';
export const BAR_DARK_BORDER_COLOR = '#0000b0';



import { GraphBarHelper } from './graphbarhelper.js';



export class Bar {

    #value;
    #ratio;
    #height;

    constructor(value) {
        this.#value  = value;
        this.#ratio  = 0;
        this.#height = 0;
    }

    getValue()                  {  return this.#value;   }
    getValueRatio()             {  return this.#ratio;   }
    getHeight()                 {  return this.#height;  }
    

    setValue(newVal) {
        let correctedValue = newVal;
        if (newVal < 0)              correctedValue = 0;
        if (newVal > MAXIMUM_VALUES) correctedValue = MAXIMUM_VALUES;
        
        this.#value = correctedValue;
    }

    setRatio(maxValue) {
        const maxValueCorrected = maxValue>0 ? maxValue : 1;
        this.#ratio = this.#value / maxValueCorrected;
    }


    setHeight(maxBarHeight) {
        const maxBarHeightCorrected = (maxBarHeight>=10 && maxBarHeight<=DEFAULT_BAR_HEIGHT) ? maxBarHeight : DEFAULT_BAR_HEIGHT;
        this.#height = Math.round(this.#ratio *  maxBarHeightCorrected);
    }
 
}





export class GraphBar extends HTMLElement {
    
    
    connectedCallback() {

        
        // testBarClass();     // Uncomment this line if you want to do some tests... 

        this.initData();
        this.injectHTML();
        this.configAllCSS();
        this.setTitle(this.title);
        this.render();        
    }

    // This method the initial setting of the core fields that are going to be used by this object,
    // plus it prepare the data to be displayed by the Web Component...
    initData() {

        this.width  = this.hasAttribute('width') ? this.getAttribute('width') : DEFAULT_COMPONENT_WIDTH;
        this.height = this.hasAttribute('height') ? this.getAttribute('height') : DEFAULT_COMPONENT_HEIGHT;
        this.canvasWidth = this.width - 10;
        this.canvasHeight = this.height - 10;
        console.log( `Container size [${this.width},${this.height}] , Canvas size [${this.canvasWidth},${this.canvasHeight}]`);

        
        if ( this.hasAttribute("data") ) {

            this.data = [];
            const splited = this.getAttribute('data').split(",");

            splited.forEach(element=>{ this.data.push( parseInt(element) )  });
            console.log('Data size: ' + this.data.length + " -->" + this.data );
        } else
            console.log('No data provided to the GraphBar Component!');


        if ( this.hasAttribute("title") ) {

            this.title = this.getAttribute('title');
        } else {
            this.title = 'Bar Graph';
            console.log('No title provided to the GraphBar Component!');
        }
              



        const helper = new GraphBarHelper(this.data);          
        helper.process(this.width,this.height);
        this.barsToDrawArray = [...helper.allBars];
        
    }



    setTitle(newTitle) {

        this.querySelector('#title').innerHTML = newTitle;
    }

    configAllCSS() {

        this.configContainerCSS();
        this.configCanvasCSS();
        this.configTitleCSS();
    }

    // Set the CSS for the container in the backgroud of the GraphBar control
    configContainerCSS() {

        this.querySelector('.container').style.position = 'relative';
        this.querySelector('.container').style.width = `${this.width}px`;          //working
        this.querySelector('.container').style.height = `${this.height}px`;        //working

        this.querySelector('.container').style.overflow = 'hidden';
        this.querySelector('.container').style.backgroundColor = 'white';    
    }

    configCanvasCSS() {
        this.querySelector('#myCanvas').style.margin = 'auto';
        this.querySelector('#myCanvas').style.backgroundColor = '#e0e0e0';
    }

    configTitleCSS() {

        this.querySelector('#title').style.textAlign = 'center';
        this.querySelector('#title').style.fontWeight = 'bold';
    }

    injectHTML() {

        this.innerHTML = `
            <div class="container">
                <div id="title">Values</div>
                <canvas id="myCanvas" width="${this.canvasWidth}" height="${ this.canvasHeight}"></canvas>
                <div class="section-1">Values</div>
            </div> `;
    }


   render() {
        
        var canvas = this.querySelector('#myCanvas');
        var context = canvas.getContext('2d');

        this.drawGraphLines(context);
        this.drawBars(context);
    }

    drawGraphLines(context) {

        context.strokeStyle = '#939393';
        context.lineWidth = 1;
        let yStart = 0;
        let xStart = 0;
        let xEnd = this.canvasWidth;
        let nbrLines = 5;
        let yIncrement = Math.round(this.canvasHeight / nbrLines);

        for (let i=0;i<nbrLines;i++) {

            context.beginPath();
            context.moveTo(xStart, yStart);
            context.lineTo(xEnd, yStart);
            context.stroke(); 

            yStart += yIncrement;
        }

    }


    drawBars(context){

        context.fillStyle = BAR_MAIN_COLOR;
       
        

        const nbrBars = this.barsToDrawArray.length;
        const interBarSpace = 5;
        const usuableWidth = this.canvasWidth - ((nbrBars+1) * interBarSpace);
        const barWidth = Math.round(usuableWidth / nbrBars);        
        let xStart = interBarSpace;

        
        for (let i=0;i<nbrBars;i++) {

            const barHeight = this.barsToDrawArray[i].getHeight();
            
            context.strokeStyle = BAR_BORDER_COLOR;
            context.lineWidth = 1;
            context.fillRect(xStart, this.canvasHeight - barHeight, barWidth, barHeight);     
            context.strokeRect(xStart, this.canvasHeight - barHeight, barWidth, barHeight);     
            
            
            context.strokeStyle = BAR_DARK_BORDER_COLOR;
            context.lineWidth = 5;
            context.beginPath();
            context.moveTo(xStart+barWidth-3, this.canvasHeight - barHeight);
            context.lineTo(xStart+barWidth-3, this.canvasHeight);
            context.stroke(); 
            
            xStart += barWidth + interBarSpace;
        }

    }


}



customElements.define('graph-bar', GraphBar);


//////////////////////////////////////////////////////////////////////////////////
//                                    NOTES
//////////////////////////////////////////////////////////////////////////////////
//  April 6, 2023
//  Item #1 & #2: completed
//  Item #3: Not important and won't be done
//
//  April 5, 2023
//  Next items:
// 1 - Draw horizontal lines in the Bar Graph, so that is easier to read the bars for the user
// 2 - Add border to the bars, and also a gradient fill
// 3 - Draw Bars in different colors
// 4 - Start a  new Graph project, but this one will be data plotted (and not bars). See the PorteFoliaApp and it Nasdac graph...
// 5 - Revist this Bar Graph, but use HTML divs instead to draw the bars?
