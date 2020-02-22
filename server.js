const Fs = require('fs');
const Hapi = require('@hapi/hapi');
const Stream = require('stream');

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

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

init();
