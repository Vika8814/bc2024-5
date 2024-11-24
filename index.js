const express = require('express');
const fs = require('fs');
const path = require('path');
const {program} = require('commander');
const multer = require('multer');

const mlt = multer();


program
  .requiredOption('-h, --host <host>', 'server host')
  .requiredOption('-p, --port <port>', 'server port')
  .requiredOption('-c, --cache <cachePath>', 'cache directory');
program.parse(process.argv);

const options = program.opts();
const lab5 = express();
lab5.use(express.json());
lab5.use(express.urlencoded({ extended: true })); // Додаємо middleware для розбору параметрів у вигляді key=value

lab5.get('/notes/:note_name', (req, res) => {
  const path_to_note = path.join(options.cache, `${req.params.note_name}.txt`);
  fs.readFile(path_to_note, null, (err, data) => {
    if (err) {
      return res.status(404).send('Not found');
    }
    res.send(data);
  });
});

lab5.put('/notes/:note_name', (req, res) => {
    const path_to_note = path.join(options.cache, `${req.params.note_name}.txt`);
    fs.access(path_to_note, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).send('Not found');
      }
      fs.writeFile(path_to_note, req.body.text, (err) => {
        if (err) throw err;
        res.send('Updated');
      });
    });
});

lab5.delete('/notes/:note_name', (req, res) => {
    const path_to_note = path.join(options.cache, `${req.params.note_name}.txt`);
    fs.unlink(path_to_note, (err) => {
      if (err) {
        return res.status(404).send('Not found');
      }
      res.send('Deleted');
    });
});

lab5.get('/notes', (req, res) => {
    fs.readdir(options.cache, (err, files) => {
      if (err) throw err;
      const notes = files.map((file) => {
        const data = fs.readFileSync(path.join(options.cache, file), 'utf-8');
        return {name: path.basename(file), text: data };
      });
      res.json(notes);
    });
});

lab5.post('/write', mlt.none(), (req, res) => {
    // Перевіряємо, чи параметр note_name та note є в тілі запиту
    if (!req.body.note_name || !req.body.note) {
        return res.status(400).send('Bad request. note_name and note are required.');
    }

    const path_to_note = path.join(options.cache, `${req.body.note_name}.txt`);

    fs.access(path_to_note, fs.constants.F_OK, (err) => {
        if (!err) {
            return res.status(400).send('Bad request. File already exists.');
        }

        // Перевіряємо, чи не є параметр note undefined або порожнім
        if (!req.body.note) {
            return res.status(400).send('Bad request. Note text is missing.');
        }

        // Записуємо текст нотатки у файл
        fs.writeFile(path_to_note, req.body.note, (err) => {
            if (err) {
                return res.status(500).send('Error writing file');
            }
            res.status(201).send('Created');
        });
    });
});


lab5.get('/UploadForm.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'UploadForm.html'));
});


lab5.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}`);
});