export interface Epic {
  id: string;
  title: string;
  description: string;
}

export interface UserStory {
  id: string;
  epicId: string;
  title: string;
  acceptance: string;
}

export interface DevTask {
  id: string;
  storyId: string;
  title: string;
  estimate: "S" | "M" | "L" | "XL";
  notes: string;
}

export interface QATask {
  id: string;
  storyId: string;
  title: string;
  type: "functional" | "regression" | "performance" | "accessibility";
}

export interface ConversionOutput {
  epics: Epic[];
  userStories: UserStory[];
  devTasks: DevTask[];
  qaTasks: QATask[];
}

export interface Conversion {
  id: string;
  user_id: string | null;
  prd_text: string;
  output: ConversionOutput;
  created_at: string;
}
