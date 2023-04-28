import { Bar } from './graphbar.js';





export const testBarClass= () => {
    const bar1 =  new Bar(2);
    let result;

    result = bar1.getValue();
    
    bar1.setValue(4);
    result = bar1.getValue();
    bar1.setValue(-1);
    result = bar1.getValue();
    bar1.setValue(100);
    result = bar1.getValue();


    bar1.setValue(5);
    result = bar1.getValueRatio();
    bar1.setRatio(30);
    result = bar1.getValueRatio();
    bar1.setValue(10);
    bar1.setRatio(30);
    result = bar1.getValueRatio();
    
    result = bar1.getHeight();
    bar1.setValue(10);
    bar1.setRatio(30);
    bar1.setHeight(100);
    result = bar1.getHeight();
    bar1.setRatio(30);
    bar1.setHeight(5);
    result = bar1.getHeight();
    bar1.setRatio(30);
    bar1.setHeight(400);
    result = bar1.getHeight();
    
    const a = 2;
}


