// services/skillService.ts
import { db } from '../config/db';
const { nanoid } = require('nanoid');

// Interface for skill creation
interface CreateSkillData {
  name: string;
  userId: string;
}

// Interface for skill deletion
interface DeleteSkillData {
  id: string;
  userId: string;
}

// Service to create a new skill
export const createSkillService = async ({ name, userId }: CreateSkillData) => {
  try {
    // Check for duplicate skill name
    const existingSkill = await db.skill.findFirst({ where: { name } });
    if (existingSkill) {
      return {
        ok: false,
        status: 400,
        message: 'A skill with this name already exists',
        errors: [{ message: 'Duplicate skill name' }],
      };
    }

    // Generate a new skill ID using nanoid
    const skillId = nanoid(10);

    // Create the new skill
    const newSkill = await db.skill.create({
      data: {
        id: skillId,
        name,
      },
    });

    // Log action history
    await db.actionHistory.create({
      data: {
        action: 'Create',
        entity: 'Skill',
        entityIds: [{ id: newSkill.id, name: newSkill.name }],
        userId: userId,
      },
    });

    return {
      ok: true,
      status: 201,
      message: 'Skill created successfully',
      data: newSkill,
    };
  } catch (error: any) {
    console.error('Error creating skill:', error);

    return {
      ok: false,
      status: 500,
      message: 'An error occurred while creating the skill',
      errors: [{ message: error.message }],
    };
  }
};

// Service to delete a skill
export const deleteSkillService = async ({ id, userId }: DeleteSkillData) => {
  try {
    // Check if the skill exists
    const existingSkill = await db.skill.findUnique({ where: { id } });
    if (!existingSkill) {
      return {
        ok: false,
        status: 404,
        message: 'Skill not found',
        errors: [{ message: 'Skill does not exist' }],
      };
    }

    // Delete the skill
    await db.skill.delete({ where: { id } });

    // Log action history
    await db.actionHistory.create({
      data: {
        action: 'Delete',
        entity: 'Skill',
        entityIds: [{ id: existingSkill.id, name: existingSkill.name }],
        userId: userId,
      },
    });

    return {
      ok: true,
      status: 200,
      message: 'Skill deleted successfully',
      data: { id: existingSkill.id, name: existingSkill.name },
    };
  } catch (error: any) {
    console.error('Error deleting skill:', error);

    // Log failed deletion attempt
    await db.actionHistory.create({
      data: {
        action: 'Failed Delete',
        entity: 'Skill',
        entityIds: [{ id }],
        userId: userId,
      },
    });

    return {
      ok: false,
      status: 500,
      message: 'An error occurred while deleting the skill',
      errors: [{ message: error.message }],
    };
  }
};
