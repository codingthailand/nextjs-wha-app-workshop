export type Course = {
  id: number;
  title: string;
  detail: string;
  picture: string;
};

type CourseResponse = {
  data: Course[];
};

export async function getCourses(): Promise<Course[]> {
  const response = await fetch("https://api.codingthailand.com/api/course");

  if (!response.ok) {
    throw new Error(`Failed to fetch courses (HTTP ${response.status})`);
  }

  const json: CourseResponse = await response.json();
  return json.data;
}
