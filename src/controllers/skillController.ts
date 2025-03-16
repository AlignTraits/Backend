// controllers/skillController.ts
import { Request, Response } from 'express';
import {
  createSkillService,
  deleteSkillService,
} from '../services/skillService';

// Controller for creating a skill
export const createSkillController = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const userId = (req as any)?.user?.id ?? '';

    if (!name) {
      return res.status(400).send({
        error: 'Skill name is required',
      });
    }

    const newSkill = await createSkillService({ name, userId });

    res.status(newSkill.status).send(newSkill);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: 'An error occurred while creating the skill' });
  }
};

// Controller for deleting a skill
export const deleteSkillController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any)?.user?.id ?? '';

    if (!id) {
      return res.status(400).send({
        error: 'Skill ID is required',
      });
    }

    const result = await deleteSkillService({ id, userId });

    res.status(result.status).send(result);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: 'An error occurred while deleting the skill' });
  }
};
