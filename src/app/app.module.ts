import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopicListComponent } from './topic-list/topic-list.component';
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {NgxPaginationModule} from "ngx-pagination";
import {NgbModule, NgbTypeaheadModule} from "@ng-bootstrap/ng-bootstrap";
import { TransformTopicPipe } from './transform-topic.pipe';

@NgModule({
  declarations: [
    AppComponent,
    TopicListComponent,
    TransformTopicPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgbTypeaheadModule,
    NgbModule
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
