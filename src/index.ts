import app from './app';
import preventDisabledService from './lib/preventDisabledServices';

const port = process.env.PORT || 5000;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});

preventDisabledService();