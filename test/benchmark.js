var binary = require("../lib/binary");
var bin = new binary.Binary();

var iter = process.ARGV[2];

Buffer.prototype.pprint = function() {
	var line = "";
	if(this.length > 0) {
		for(var i=0; i<this.length; i++) {
			if(i%8==0) {
				process.stdout.write(" ");
			}
			if(i%16==0) {
				process.stdout.write(line);
				line = "";			
				process.stdout.write("\n");
				var ss = "00000000" + i.toString(10);
				process.stdout.write(ss.slice(ss.length - 8) + ": ");
			}
			if(this[i] > 15) {
				process.stdout.write(this[i].toString(16) + " ");
			}
			else {
				process.stdout.write("0" + this[i].toString(16) + " ");
			}
			if(this[i] >= 0x20 && this[i] <= 0x7e) {
				line += String.fromCharCode(this[i]);
			}
			else {
				line += ".";
			}
		}
		process.stdout.write("\n");
	}
}

var key = "hello";
var record = [
        {"int": 0x80},
        {"int": 0x00},
        {"int16": key.length},
        {"int": 0x00},
        {"int": 0},
        {"int16": 0},
        {"int32": key.length},
        {"int32": 0},
        {"int32": 0},
        {"int32": 0},
        {"string": key}
];

function displayResults(name, size, recs, time, bytes, sep) {
	if(!sep) sep = ",";
	console.log(name + sep + size + sep + recs + sep + time + sep + bytes + sep + (recs/time).toFixed(2) + sep +  parseInt((((bytes)/time)*8)/(1024*1024)));
}

function runtest() {
	var buff = new Buffer(1024);
	var size = bin.pack(record, buff, 0);
	var buff = new Buffer(size * iter);
	var bytes = 0;
	var recs = 0;
	var then = new Date().getTime();
	var written = bin.pack(record, buff, bytes);
	
	for(var i=0; i<iter; i++) {
		var written = bin.pack(record, buff, bytes);
		bytes += written;
		recs++;
	}
	
	var now = new Date().getTime();
	var time = (now-then)/1000;
	displayResults("binary.pack", written, recs, time, bytes);
	
	var buff = new Buffer(JSON.stringify(record).length * iter);
	var bytes = 0;
	var recs = 0;
	var rec = JSON.stringify(record);
	var then = new Date().getTime();
	
	for(var i=0; i<iter; i++) {
		rec = JSON.stringify(record);
		buff.write(rec, bytes);
		bytes += rec.length;
		recs++;
	}
	
	var now = new Date().getTime();
	var time = (now-then)/1000;
	displayResults("JSON.stringify", rec.length, recs, time, bytes);
	
	var bytes = 0;
	var recs = 0;
	var rec = JSON.stringify(record);
	var then = new Date().getTime();
	
	for(var i=0; i<iter; i++) {
		buff.write(rec, bytes, "utf8");
		bytes += rec.length;
		recs++;
	}
	
	var now = new Date().getTime();
	var time = (now-then)/1000;
	displayResults("Buffer.write(string-utf8)", rec.length, recs, time, bytes);
	
	
	var bytes = 0;
	var recs = 0;
	var rec = JSON.stringify(record);
	var then = new Date().getTime();
	
	for(var i=0; i<iter; i++) {
		buff.write(rec, bytes, "ascii");
		bytes += rec.length;
		recs++;
	}
	
	var now = new Date().getTime();
	var time = (now-then)/1000;
	displayResults("Buffer.write(string-ascii)", rec.length, recs, time, bytes);
	
	var bytes = 0;
	var recs = 0;
	var rec = new Buffer(JSON.stringify(record), "ascii");
	var buff = new Buffer(rec.length * iter);
	var then = new Date().getTime();
	
	for(var i=0; i<iter; i++) {
		rec.copy(buff, bytes, 0);
		bytes += rec.length;
		recs++;
	}
	
	var now = new Date().getTime();
	var time = (now-then)/1000;
	displayResults("Buffer.copy", rec.length, recs, time, bytes);
	
	var int_sym = "int";
	var int16_sym = "int16";
	var int32_sym = "int32";
	var string_sym = "string";
	
	function encode(arr) {
		var len = arr.length;
		var buff = "[";
		var i = 0;
		while(i < len) {
			var prop = arr[i++];
			if(string_sym in prop) {
				buff += "s:\"" + prop.string + "\"";
			}
			else if(int_sym in prop) {
				buff += "1:" + prop.int;
			}
			else if(int16_sym in prop) {
				buff += "2:" + prop.int16;
			}
			else if(int32_sym in prop) {
				buff += "3:" + prop.int32;
			}
			if(i<len) {
				buff += ",";
			}
		}
		buff += "]";
		return buff;
	}
	
	var bytes = 0;
	var recs = 0;
	var rec = encode(record);
	var buff = new Buffer(rec.length * iter);

	var then = new Date().getTime();
	
	for(var i=0; i<iter; i++) {
		buff.write(encode(record), bytes, "ascii");
		bytes += rec.length;
		recs++;
	}
	
	var now = new Date().getTime();
	var time = (now-then)/1000;
	displayResults("custom.encode", rec.length, recs, time, bytes);

	var bytes = 0;
	var recs = 0;
	var rec = encode(record);
	var buff = [];
	var then = new Date().getTime();
	
	for(var i=0; i<iter; i++) {
		buff.push(rec);
		bytes += rec.length;
		recs++;
	}
	
	var now = new Date().getTime();
	var time = (now-then)/1000;
	displayResults("array.push", rec.length, recs, time, bytes);

	var bytes = 0;
	var recs = 0;
	var rec = encode(record);
	var buff = "";
	var then = new Date().getTime();
	
	for(var i=0; i<iter; i++) {
		buff += rec;
		bytes += rec.length;
		recs++;
	}
	
	var now = new Date().getTime();
	var time = (now-then)/1000;
	displayResults("string.concat", rec.length, recs, time, bytes);

}
for(var i=0; i<process.ARGV[3]; i++) {
	runtest();
}

