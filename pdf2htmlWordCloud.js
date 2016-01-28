/**
 * Copyright (C) 2016, ELP
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */
 
const cloud_size = 14;
const cloud_max_size = 17;

const str1 = '<html><head><title></title><script src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script><script src="jqcloud2/dist/jqcloud.min.js"></script><link rel="stylesheet" href="jqcloud2/dist/jqcloud.min.css"></head><body style="background:white"><div style="width:100%; height: 100%;" id="demo"></div><script>var words = ';
const str2 = ";$('#demo').jQCloud(words, {classPattern: null,colors: [" + '"#B40404"],fontSize: {from: 0.09,to: 0.02}});</script></body></html>';

function emptyWord(word) {
	if (word.length <= 2)
		return true;
	var prefix = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', '-', '_'];
	for (var i = 0; i < prefix.length; i++)
		if (word.charAt(0) == prefix[i])
			return true;
	var emptyWords = ["de", "horas", "del", "todas", "ii", "grado", "", "las", "ese", "durante",
					"ejercicios", "los", "iii", "evaluar", "â€¢", "trabajo", "sera", "resto",
					"teoricas", "otras", "calificacion", "con", "sin", "para", "evaluables",
					"por", "and", "final", "curso",	"una", "practicas", "que", "dirigidas",
					"muy", "asignatura", "mas", "cual",	"director",	"docente", "valorar",
					"firma", "departamento", "fecha", "complutense", "madrid", "decanato",
					"dia", "facultad", "junio",	"aula", "septiembre", "pruebas", "competencias",
					"jun", "parcial", "realizadas", "febrero", "nota", "podrán", "coordinador",
					"evaluación", "prueba",	"feb", "estas", "alumno", "comunes", "generales",
					"comun", "todos", "misma", "universidad", "complutens", "ficha", "personas",
					"incluir", "mismo", "uno", "profesores", "clases", "adrid", "sep", "plazo",
					"podra", "minima", "parciales", "cada", "optativas", "ECTS", "org", "mediante",
					"laboratorio", "examen", "obligatorias", "siendo", "tiene",
					"evaluacion", "actividades", "grupos", "realizacion",
					"detallado", "examenes", "docencia", "materia", "the"];
	for (var i = 0; i < emptyWords.length; i++)
		if (word == emptyWords[i])
			return true;
	return false;	
}

function getHtml(fileName) {
	var filePath = "fichas_docentes/" + fileName + ".pdf";
	var extract = require('pdf-text-extract'); 
	var fs = require('fs');

	extract(filePath, { splitPages: false }, function (err, text) {
	  if (err)
		throw err;
	  else {
		var allText = text[0];
		for (var i = 1; i < text.length; i++)
			allText = allText.concat(text[i]);
		var cleanedText = allText.replace(/[áàä]/gi,"a").replace(/[éèë]/gi,"e").replace(/[íìï]/gi,"i").replace(/[óòö]/gi,"o")
								 .replace(/[úùu]/gi,"u").replace(/ñ/gi,"n").replace(/ç/gi,"c").replace(/o©/g,"e")
								 .replace(/Ã¡/g,"a").replace(/oI�/g,"o").replace(/ódulo/g,"modulo").replace(/[()³.:,\n\t\r]/g,"")
								 .replace(/\]/g,"").toLowerCase();
		var allWords = cleanedText.split(" ");
		var wordsCount = {};
		for (var word in allWords) {
			if (!emptyWord(allWords[word]))
				if (wordsCount[allWords[word]] == undefined)
					wordsCount[allWords[word]] =  1;
				else
					wordsCount[allWords[word]]++;
		}
		allWords = [];
		for (var word in wordsCount)
			allWords.push({"text": word, "weight": wordsCount[word]});
		allWords.sort(function(a, b){return b.weight - a.weight});
		
		var max = allWords[0].weight;
		for (var word in allWords)
			allWords[word].weight = Math.round(allWords[word].weight * cloud_max_size * 100 / max) / 100;
		
		fs.writeFile("nubes_ficha_docente/" + fileName + ".html", str1 + JSON.stringify(allWords.slice(0,cloud_size)) + str2, function (err) {
		  if (err)
			throw err;
		});
	  }
	})
}

getHtml(process.argv[2]);