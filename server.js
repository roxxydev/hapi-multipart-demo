const Hapi = require('@hapi/hapi');
const Fs = require('fs');
const Stream = require('stream');
const Path = require('path');
const Mime = require('mime');

const init = async () => {
  const server = Hapi.server({
    host: 'localhost',
    port: Number(process.argv[2] || 8080)
  });

  server.route({
    method: 'POST',
    path: '/submit',
    handler: (request, h) => {
      const data = request.payload;

      if (data.file) {
        const name = data.file.hapi.filename;
        const outputFilePath = `${__dirname}/uploads/${name}`;
        const writeStream = Fs.createWriteStream(outputFilePath);

        writeStream.on('Write Stream Error', (err) => console.error('Error', err));
        writeStream.on('Write Stream Close', () => console.error('Done'));

        const bufferStream = new Stream.PassThrough();
        bufferStream.end(Buffer.from(data.file._data));
        bufferStream.pipe(writeStream);
      }

      return 'ok';
    },
    options: {
      payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data',
        maxBytes: 25 * 1048576
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/download',
    handler: (request, h) => {
      const files = Fs.readdirSync(`${__dirname}/uploads/`);
      const filename = files && files.length > 0 ? files[0] : '';

      if (!filename) {
        return h.response(404);
      }

      const fileExt = Path.extname(filename).replace(/\./g, '');
      const mimeType = Mime.getType(fileExt);

      const outputFilePath = `${__dirname}/uploads/${filename}`;
      const fileBuffer = Fs.readFileSync(outputFilePath);

      const response = h.response(fileBuffer);
      response.code(200);
      response.bytes(fileBuffer.length);
      response.type('text/plain');
      response.header('Content-Type', mimeType);
      response.header('Content-Disposition', `attachment; filename="${filename}"`);

      return response;
    }
  });

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

init();
