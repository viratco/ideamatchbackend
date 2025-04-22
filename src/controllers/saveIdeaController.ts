import { Request, Response } from 'express';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

export const saveIdea = async (req: Request, res: Response) => {
  try {
    const { title, description, details } = req.body;
    const userId = (req as any).user?.id;
    if (!title || !userId || !details) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const result = await pool.query(
      'INSERT INTO ideas (user_id, title, description, details) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title, description, details]
    );
    return res.status(201).json({ idea: result.rows[0] });
  } catch (err) {
    console.error('Error saving idea:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getSavedIdeas = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const result = await pool.query(
      'SELECT * FROM ideas WHERE user_id = $1 ORDER BY id DESC',
      [userId]
    );
    res.json({ ideas: result.rows });
  } catch (err) {
    console.error('Error fetching saved ideas:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
