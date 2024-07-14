import request from 'supertest';
import {index as app} from '../index.js'; // Ajusta la ruta según la ubicación real de tu archivo index.js
import {faker} from '@faker-js/faker'; // Ajusta el import según la forma correcta de importar faker

describe('Operaciones CRUD de cafés', () => {
    // Obtener todos los cafés
    describe('GET /cafes', () => {
        it('debería obtener todos los cafés', async () => {
            const respuesta = await request(app).get('/cafes');
            expect(respuesta.status).toBe(200);
            expect(Array.isArray(respuesta.body)).toBeTruthy();
            expect(respuesta.body.length).toBeGreaterThan(0); // Verifica que se reciban al menos un café
        });
    });

    // Agregar un nuevo café
    describe('POST /cafes', () => {
        it('debería agregar un nuevo café y devolver un status 201', async () => {
            const nuevoCafe = { nombre: faker.person.firstName() }; // Genera un nombre aleatorio para el café
            const respuesta = await request(app).post('/cafes').send(nuevoCafe);
            expect(respuesta.status).toBe(201);
            expect(Array.isArray(respuesta.body)).toBeTruthy();
            expect(respuesta.body).toContainEqual(expect.objectContaining(nuevoCafe)); // Verifica que el café se haya agregado correctamente
        });

        it('debería devolver un status 400 si ya existe un café con ese nombre', async () => {
            const nombreExistente = 'Café Existente'; // Nombre ficticio ya existente
            const nuevoCafe = { nombre: nombreExistente };
            const respuesta = await request(app).post('/cafes').send(nuevoCafe);
            expect(respuesta.status).toBe(400);
            expect(respuesta.body.message).toBe('Ya existe un cafe con ese id');
        });
    });

    // Actualizar un café existente
    describe('PUT /cafes/:id', () => {
        it('debería devolver un status 400 si intenta actualizar un café enviando un id diferente en los parámetros', async () => {
            const cafeExistente = await request(app).get('/cafes').then(res => res.body[0]); // Obtener un café existente para actualizar
            const fakeId = 'id-invalido'; // ID ficticio no válido
            const actualizar = { id: fakeId, nombre: faker.person.firstName() }; // Genera un nombre aleatorio para actualizar
            const respuesta = await request(app).put(`/cafes/${cafeExistente.id}`).send(actualizar);
            expect(respuesta.status).toBe(400);
            expect(respuesta.body.message).toBe('El id del parámetro no coincide con el id del café recibido');
        });
    
        it('debería devolver un status 404 si no existe un café con el id especificado', async () => {
            const fakeId = 'id-invalido'; // ID ficticio no válido
            const actualizar = { nombre: faker.person.firstName() }; // Genera un nombre aleatorio para actualizar
            const respuesta = await request(app).put(`/cafes/${fakeId}`).send(actualizar);
            expect(respuesta.status).toBe(400);
            expect(respuesta.body.message).toBe('El id del parámetro no coincide con el id del café recibido');
        });
    });
    

    // eliminar un café
    describe('DELETE /cafes/:id', () => {
        it('debería devolver un status 404 al intentar eliminar un café con un id inexistente', async () => {
            const fakeId = 'id-invalido'; // ID ficticio no válido
            const respuesta = await request(app).delete(`/cafes/${fakeId}`).set('Authorization', 'token');
            expect(respuesta.status).toBe(404);
            expect(respuesta.body.message).toBe('No se encontró ningún cafe con ese id');
        });

        it('debería devolver un status 400 si no se proporciona token de autorización', async () => {
            const cafeExistente = await request(app).get('/cafes').then(res => res.body[0]); 
            const respuesta = await request(app).delete(`/cafes/${cafeExistente.id}`);
            expect(respuesta.status).toBe(400);
            expect(respuesta.body.message).toBe('No recibió ningún token en las cabeceras');
        });
    });

    // rutas no existentes
    describe('Rutas no existentes', () => {
        it('debería devolver un status 404 para rutas no definidas', async () => {
            const respuesta = await request(app).get('/ruta-no-existe');
            expect(respuesta.status).toBe(404);
            expect(respuesta.body.message).toBe('La ruta que intenta consultar no existe');
        });
    });
});
