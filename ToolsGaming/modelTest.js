/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var mods = require('./main.js');

var shs = {};
shs.obj1 = [[-30,-15],[-30,15],[30,15],[0,-15]];
shs.obj2 = [[-20,0],[0,20],[20,0],[0,-20]];
shs.obj3 = [[-40,-5],[-40,5],[40,5],[40,-5]];

console.log('Immediate reject:');
console.log(mods.ToolPicker.Model('obj1', [100,100], 'test', shs));
console.log('');

console.log('Success:');
console.log(mods.ToolPicker.Model('obj1', [85,390], 'test', shs));
console.log('');


console.log('Failure:');
console.log(mods.ToolPicker.Model('obj1', [500,300], 'test', shs));
console.log('');


console.log('From mod:');
console.log(mods.ToolPicker.Model('obj3', [337,78], 'test', shs));
console.log('');