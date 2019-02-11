var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

/**
 * Búsqueda por colección
 */
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var coleccion = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (coleccion) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex)
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex)
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex)
            break;
        default:
            res.status(400).json({
                ok: false,
                mensaje: 'Los tipo de busqueda son usuarios, médicos y hospitales',
                error: { message: 'Tipo de tabla/colección no válido' }
            });

    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            tabla: data
        });
    });

});


/**
 * Búsqueda General
 */
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ]).then(respuesta => {
        res.status(200).json({
            ok: true,
            hospitales: respuesta[0],
            medicos: respuesta[1],
            usuarios: respuesta[2]
        });
    })

});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar los hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });

    });
}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar los médicos', err);
                } else {
                    resolve(medicos);
                }
            });

    });
}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Medico.find({}, 'nombre email role img')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });

    });
}

module.exports = app;