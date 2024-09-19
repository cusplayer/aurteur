import express from 'express';
import cors from 'cors';
import { allRouter, oneRouter } from 'api';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

app.use('/api/texts', allRouter);
app.use('/api/texts', oneRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});