import { CourseDetailService } from './course-detail.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import{Course,Slot} from './course';

@Component({
  selector: 'app-book-trial',
  templateUrl: './book-trial.component.html',
  styleUrls: ['./book-trial.component.css']
})
export class BookTrialComponent implements OnInit {

  public trialForm:FormGroup;
  public coursesNames:string[] = [];   //array for course names dropdown
  public courseSlots:Slot[] = [];      //slots of the selected course
  public _allCourses:Course[] = [];    // all courses array
  public havePC:string[] = ["Do child have a Laptop/Computer", "Yes", "No"];
  public possible_date:number[] = [];  //array of dates > 4 hours and < 7 days from current time
  public possible_time:string[] = [];  //array of dates > 4 hours and < 7 days from current time
  public min_date = "";
  public max_date = "";
  public trialBooked = false;
  public courseSelected = false;
  public dateSelected = false;
  public timeSelectd = false;


  private _courseIndex:number; 
  constructor(private courseDetail:CourseDetailService) { }

  ngOnInit(): void {
    this.trialForm = new FormGroup({
      'parentName': new FormControl(null, Validators.required),
      'parentEmail':new FormControl(null, [Validators.required, Validators.email]),
      'parentNumber':new FormControl(null, Validators.required),
      'childName': new FormControl(null, Validators.required),
      'childAge': new FormControl(null, Validators.required),
      'havePC': new FormControl(this.havePC[0]),
      'trialDate': new FormControl(null,Validators.required),
      'courseName': new FormControl("Select a Course For Trial",Validators.required),
      'slotTime': new FormControl("Select slot time",Validators.required),
    });
    this.courseDetail.getAvilableCourses().subscribe((courses:Course[])=>{
      courses.forEach((item)=>{
        this.coursesNames.push(item.course_name);
        this._allCourses.push(item);
      });
    });
  }

  onSubmit(){
    console.log(this.trialForm);
    this.courseSelected = false;
    this.dateSelected = false;
    this.timeSelectd = false;
    let data = {
      course: this.getSelectedCourse(),
      parentEmail: this.trialForm.value.parentEmail,
      childName: this.trialForm.value.childName,
      parentName: this.trialForm.value.parentName,
      slotTime: new Date(this.getSelectedTime()).toString()
    }
    this.courseDetail.bookTrial(data).subscribe((result)=>{
      this.trialBooked = true;
      setTimeout(()=>{
        this.remove();
      },3000)
    });
    this.trialForm.reset();
    this.trialForm.setControl('courseName', new FormControl("Select a Course For Trial",Validators.required));
    this.trialForm.setControl('slotTime', new FormControl("Select slot time",Validators.required));
  }

  onCourseChange(courseSelected:string){
    this.min_date = '';
    this.max_date = '';
    this.courseSelected = true;
    this.dateSelected = false;
    this.timeSelectd = false;
    this.possible_date = [];
    this.possible_time = [];
    this._courseIndex = this.coursesNames.indexOf(courseSelected);
    let currentTime = new Date().getTime();
    this.courseSlots = this._allCourses[this._courseIndex].slots;
    this.courseSlots.forEach((item)=>{
        if(+item.slot >= currentTime+4*60*60*1000 && +item.slot <= currentTime+7*24*60*60*1000){
          this.possible_date.push(+item.slot);
          this.possible_date.sort();
        }
    });
    this.min_date = new Date(this.possible_date[0]).getFullYear()+'-'
                    +(new Date(this.possible_date[0]).getMonth()+1)+'-'
                    +new Date(this.possible_date[0]).getDate();
    this.max_date = new Date(this.possible_date[this.possible_date.length-1]).getFullYear()+'-'
                    +(new Date(this.possible_date[this.possible_date.length-1]).getMonth()+1)+'-'
                    +new Date(this.possible_date[this.possible_date.length-1]).getDate();
    //console.log(, this.possible_date[this.possible_date.length-1]);
  }

  onDateSelect(){
    this.dateSelected = true;
    this.possible_time = [];
    this.possible_date.forEach((item)=>{

      let seletedDate:string = this.trialForm.value.trialDate;
      let date = new Date(item);
      if(date.getDate() == parseInt(seletedDate.split('-')[2])){
        let minutes = '';
        let hour = '';
        if(date.getMinutes()<10){
          minutes = '0';
        }
        minutes += date.getMinutes();
        if((date.getHours()%12)<10){
          hour = '0';
        }
        hour += (date.getHours()%12);
        if(date.getHours()>12){
          this.possible_time.push(hour+':'+minutes+' PM');
        }
        else if(date.getHours() == 12){
          this.possible_time.push(12+':'+minutes+' PM');
        }
        else{
          this.possible_time.push(hour+':'+minutes+' AM');
        }
      }
    })
  }
  getSelectedTime(){
    let time = this.trialForm.value.slotTime.split(':');
    let utctime = new Date(this.trialForm.value.trialDate).getTime();
    console.log(utctime);
    if(time[1].split(' ')[1] == 'AM'){
      utctime += (+time[0])*60*60*1000;
    }
    else{
      utctime += ((+time[0]+12)*60*60*1000);
    }
    utctime += ((parseInt(time[1]))*60*1000);

    utctime -= ((5*60*60+30*60)*1000);
    return utctime;
     
  }

  getSelectedCourse():Course{
    let time = this.getSelectedTime();
    let instructor_count:number;
    this._allCourses[this._courseIndex].slots.forEach((item,index)=>{
      if(+item.slot == time){
        instructor_count = item.instructor_count;
      }
    });
    let course:Course = {
      course_id: this._allCourses[this._courseIndex].course_id,
      course_name: this._allCourses[this._courseIndex].course_name,
      slots: [{slot: time+'', instructor_count:instructor_count}]
    }
    return course;
  }

  onTimeChange(){
    this.timeSelectd = true;
  }

  remove(){
    this.trialBooked = false;
  }
}
