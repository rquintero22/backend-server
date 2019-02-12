var express = require('express');

var mdAutenticacicon = require('../middlewares/autenticacion');


var app = express();

var Hospital = require('../models/hospital');

/**
 * Obtener el hospital por id
 */
app.get('/:id', (req, res) => {
    var id = req.params.id;

    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital.',
                    errors: err
                });
            }

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + ' no existe.',
                    errors: { message: 'No se encontró un hospital con ese id' }
                });
            }


            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        })
});


/**
 * Obtener todos los hospitales
 */
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;

    desde = Number(desde);

    Hospital.find({}, )
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email img')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales.',
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            });


        })

});





/**
 * Actualizar un hospital
 */
app.put('/:id', mdAutenticacicon.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital.',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe.',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital.',
                    errors: err
                });
            }

            hospitalGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    })

});


/**
 * Crear un hospital
 */
app.post('/', mdAutenticacicon.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital.',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });

    });



});

/**
 * Eliminar un hospital por el id
 */
app.delete('/:id', mdAutenticacicon.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar el hospital.',
                errors: err
            });
        }

        if (!hospitalEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe hospital con el id.',
                errors: { message: 'No existe hospital con el id.' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalEliminado
        });
    })
})

module.exports = app;