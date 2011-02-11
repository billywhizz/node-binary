var Binary = require("../lib/binary").Binary;
//var Binary = require("../lib/binary.node").Binary;
var assert = require("assert");

Buffer.prototype.pprint = function(offset, size) {
	if(size<=0) return 0;
	var i = 0;
	var end = this.length;
	if(size) {
		end = offset + size;
	}
	while(i + offset < end)
	{
		var val = this[i + offset];
		if(i%8==0 && i > 0) {
			process.stdout.write(" ");
		}
		if(i%16==0) {
			if(i>0) {
				process.stdout.write(" ");
				for(var j=i+offset-16;j<i+offset;j++) {
					var vv = this[j];
					if(vv > 0x20 && vv < 0x7e) {
						process.stdout.write(String.fromCharCode(vv));
					}
					else {
						process.stdout.write(".");
					}
				}
				process.stdout.write("\n");
			}
			var ss = "00000000" + i.toString(10)
			process.stdout.write(ss.slice(ss.length - 8) + ": ");
		}
		var bb = "0" + val.toString(16);
		process.stdout.write(bb.slice(bb.length - 2) + " ");
		i++;
	}
	if(size%16!=0) {
		for(var j=0; j<(16-(size%16)); j++) {
			process.stdout.write("   ");
		}
		process.stdout.write("  ");
		if(size%16<=8) process.stdout.write(" ");
		for(var j=i+offset-(size%16);j<i+offset;j++) {
			var vv = this[j];
			if(vv > 0x20 && vv < 0x7e) {
				process.stdout.write(String.fromCharCode(vv));
			}
			else {
				process.stdout.write(".");
			}
		}
	}
	else {
		process.stdout.write("  ");
		for(var j=size-16;j<size;j++) {
			var vv = this[j];
			if(vv > 0x20 && vv < 0x7e) {
				process.stdout.write(String.fromCharCode(vv));
			}
			else {
				process.stdout.write(".");
			}
		}
	}
	process.stdout.write("\n");
}

function unpack(buff) {
	var tmp = bin.unpack("ooonnnnnNNNs100Ns7", 0, buff);
	return [
		{"int": tmp[0]},
		{"int": tmp[1]},
		{"int": tmp[2]},
		{"int16": tmp[3]},
		{"int16": tmp[4]},
		{"int16": tmp[5]},
		{"int16": tmp[6]},
		{"int16": tmp[7]},
		{"int32": tmp[8]},
		{"int32": tmp[9]},
		{"int32": tmp[10]},
		{"string": tmp[11]},
		{"int32": tmp[12]},
		{"string": tmp[13]}
	];
}

var buff = new Buffer(136);
var bin = new Binary();

var record = [
	{"int": 0},
	{"int": 1},
	{"int": 255},
	{"int16": 0},
	{"int16": 1},
	{"int16": 255},
	{"int16": 256},
	{"int16": 65535},
	{"int32": 0},
	{"int32": 128},
	{"int32": 65535},
	{"string": "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789"},
	{"int32": 65536},
	{"string": "goodbye"}
];
var size = bin.pack(record, buff, 0);
buff.pprint(0, buff.length);
assert.equal(size, 136);
buff = buff.slice(0, size);
console.log(JSON.stringify(record, null, "\t"));
var obj = unpack(buff);
console.log(JSON.stringify(obj, null, "\t"));
assert.deepEqual(record, obj);