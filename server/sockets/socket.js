const { io } = require('../server');
const {Usuario} = require('../classes/usuarios')
const {crearMensaje} = require('../utilidades/utilidades')

const usuarios = new Usuario

io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {

        if (!data.nombre || !data.sala) {
            return callback({
                error: true,
                mensaje: 'El nombre/sala es necesario'
            })
        }

        client.join(data.sala)

        let personas = usuarios.agregarPersona(client.id, data.nombre, data.sala)

        client.broadcast.to(data.sala).emit('listaPersonas', usuarios.getPersonasPorSala(data.sala))

        client.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('Administrador', `${data.nombre} se unio al chat`))

        let personasPorSala = usuarios.getPersonasPorSala(data.sala)

        callback(personasPorSala)

    })

    client.on('crearMensaje', (data, callback) => {
        let persona = usuarios.getPersona(client.id)

        let mensaje = crearMensaje(persona.nombre, data.mensaje)

        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje)

        callback(mensaje)
    })

    client.on('disconnect', () => {
        let personaBorrada = usuarios.borrarPersona(client.id)

        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${personaBorrada.nombre} dejo el chat`))

        client.broadcast.to(personaBorrada.sala).emit('listaPersonas', usuarios.getPersonasPorSala(personaBorrada.sala))
    })

    //mensajes privados
    client.on('mensajePrivado', (data) => {

        let persona = usuarios.getPersona(client.id)

        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje))

    })

});