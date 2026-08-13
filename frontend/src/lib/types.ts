export type Me = {
  id: number;
  username: string;
  display_name: string;
  total_xp: number;
  current_streak: number;
  hearts: number;
  max_hearts: number;
  gems: number;
  daily_xp_goal: number;
  xp_today: number;
  seconds_to_next_heart: number | null;
};

export type LessonNode = {
  id: number;
  title: string;
  order_index: number;
  completed: boolean;
  locked: boolean;
};

export type SkillNode = {
  id: number;
  title: string;
  order_index: number;
  icon: string;
  status: "completed" | "available" | "locked";
  crowns: number;
  max_crowns: number;
  progress: number;
  lessons: LessonNode[];
};

export type UnitNode = {
  id: number;
  title: string;
  description: string;
  order_index: number;
  color: string;
  skills: SkillNode[];
};

export type CourseTree = {
  id: number;
  title: string;
  language_code: string;
  from_language: string;
  units: UnitNode[];
};

export type ExerciseType =
  | "multiple_choice"
  | "translate_bank"
  | "match_pairs"
  | "fill_blank"
  | "type_answer";

export type Exercise = {
  id: number;
  exercise_type: ExerciseType;
  prompt: string;
  content: Record<string, unknown>;
};

export type LessonPayload = {
  id: number;
  title: string;
  skill_id: number;
  skill_title: string;
  xp_reward: number;
  hearts: number;
  exercises: Exercise[];
};

export type LeaderboardEntry = {
  rank: number;
  user_id: number;
  display_name: string;
  username: string;
  total_xp: number;
  current_streak: number;
  is_you: boolean;
};

export type Profile = {
  me: Me;
  skills_completed: number;
  lessons_completed: number;
  achievements: { id: string; title: string; detail: string }[];
};
