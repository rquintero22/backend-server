var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válida.',
            errors: { message: 'Tipo de colección no válida' }
        });
    }

    if (!req.files) {
        res.status(400).json({
            ok: false,
            mensaje: 'No se encontró archivo para cargar.',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }


    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Sólo estas extensiones se aceptan
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida.',
            errors: { message: 'las extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }

    // Crear un nombre del archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo.',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        /*
        res.status(200).json({
            ok: true,
            mensaje: 'Archivo movido.',
            extensionArchivo: extensionArchivo
        });
        */
    });

});

/**
 * Subir por tipos
 */
function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe.',
                    errors: { message: 'Usuario no existe' }
                });
            }

            var pathAnterior = './uploads/usuarios/' + usuario.img;

            // si existe la imágen anterior la elimina
            if (fs.existsSync(pathAnterior)) {
                fs.unlink(pathAnterior);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar el usuario.',
                        errors: err
                    });
                }

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imágen de usuario actualizada.',
                    usuario: usuarioActualizado
                });
            });
        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Médico no existe.',
                    errors: { message: 'Médico no existe' }
                });
            }

            var pathAnterior = './uploads/medicos/' + medico.img;

            // si existe la imágen anterior la elimina
            if (fs.existsSync(pathAnterior)) {
                fs.unlink(pathAnterior);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar el médico.',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imágen de médico actualizada.',
                    medico: medicoActualizado
                });
            });
        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe.',
                    errors: { message: 'Hospital no existe' }
                });
            }

            var pathAnterior = './uploads/hospitales/' + hospital.img;

            // si existe la imágen anterior la elimina
            if (fs.existsSync(pathAnterior)) {
                fs.unlink(pathAnterior);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar el hospital.',
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imágen de hospital actualizada.',
                    hospital: hospitalActualizado
                });
            });
        });
    }

}

module.exports = app;