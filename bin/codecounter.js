#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var util = require('util');
var events = require('events');

var codefiles = [
	'.c','.cpp','.js','.html','.css','.py'
	,'.pl','.pm','.md','.markdown'
	,'.bat','.go','.h','.rb','.java','xhtml','.html','.less','.php','.asp'
];

var dir = process.argv[2] || './';

var exist = fs.existsSync(dir);

if(!exist){
	console.log("file not found");
}
else{
	
function Listener(){
    events.EventEmitter.call(this);
}
util.inherits(Listener, events.EventEmitter);

function Listener(){
    var self = this;
    this.count = 0;
    this.files = [];
    events.EventEmitter.call(this);    
    this.on('file',function(file){
        this.files.push(file);        
    });
    this.on('dir',function(dir){
        self.walk(dir);
    });    
    return self;
}

Listener.prototype.walk = function(mypath){
    var self = this; 
	fs.lstat(mypath,function(err,stat){
		if(stat.isFile() && self.count === 0){			
			self.count --;
			self.emit('file',mypath);
			self.emit('end');
		}else{
			fs.readdir(mypath,function(err,result){
				if(err){
					self.count--;
					self.emit('file',mypath);
					return;
				}
				self.count += result.length - 1;
				result.forEach(function(file){
					var _path = path.join(mypath,file);
					fs.lstat(_path,function(err,stat){
						if(err){
							console.log(err);
						}
						if(stat.isFile()){
							self.count --;
							self.emit('file',_path);
						}
						else{
							self.emit('dir',_path);
						}
						if(self.count < 0){
							self.emit('end');                
						}
					});
				});
		})
		}
		
	});
   
}

var walker = new Listener();
walker.on('end',function(){


//console.log(this.files);
var filesToCount = [];
this.files.forEach(function(file){
	var extname = path.extname(file).toLowerCase();
	//console.log(extname);
	if(codefiles.indexOf(extname) !== -1){
		filesToCount.push(file);
	}
});
//console.log(filesToCount);

var count = filesToCount.length;
var result = {};

filesToCount.forEach(function(file){
	fs.readFile(file,function(err,data){
		if(err) console.log(err);
		else{
			var arr = (data+"").split('\n');
			var lines = arr.length;
			
			arr.forEach(function(line){
				if(line.trim() === ""){					
					lines --;
				}
			})
			result[file] = lines;
			count --;
			if(count <= 0){
				print();
			}
		}
	});
});

function print(){
	var sorts = [];
	var total = 0;
	for(var key in result){
		sorts.push(key);
	}
	sorts.sort(function(a,b){return result[a] - result[b]});
	sorts.forEach(function(file){
		total += result[file];
		console.log(file,result[file]);
	});	
	console.log("==================================");
	console.log("total: "+total+" lines!");
}
	
});
walker.walk(dir);
	
}