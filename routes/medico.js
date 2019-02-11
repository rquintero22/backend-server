var express = require('express');

var mdAutenticacicon = require('../middlewares/autenticacion');


var app = express();

var Medico = require('../models/medico');

/**
 * Obtener todos los medicos
 */
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;

    desde = Number(desde);

    Medico.find({}, )
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando médicos.',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });


        })

});

/**
 * Obtener un médico
 */
app.get('/:id', (req, res) => {
    var id = req.params.id;

    Medico.findById(id)
        .populate('usuario', 'nombre email img')
        .populate('hospital')
        .exec((err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar médico.',
                    errors: err
                });
            }

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El médico con el id ' + id + ' no existe.',
                    errors: { message: 'No existe un médico con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                medico: medico
            });
        })
});


/**
 * Actualizar un médico
 */
app.put('/:id', mdAutenticacicon.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar médico.',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El médico con el id ' + id + ' no existe.',
                errors: { message: 'No existe un médico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el médico.',
                    errors: err
                });
            }

            medicoGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    })

});


/**
 * Crear un medico
 */
app.post('/', mdAutenticacicon.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear médico.',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });

    });

});

/**
 * Eliminar un médico por el id
 */
app.delete('/:id', mdAutenticacicon.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar el médico.',
                errors: err
            });
        }

        if (!medicoEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe médico con el id.',
                errors: { message: 'No existe médico con el id.' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoEliminado
        });
    })
})

module.exports = app;