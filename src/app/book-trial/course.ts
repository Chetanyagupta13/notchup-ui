export interface Course{
    course_id:number,
    course_name:string,
    slots:Slot[],
}
export interface Slot{
    slot:string,
    instructor_count:number
}