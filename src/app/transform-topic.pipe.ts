import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transformTopic'
})
export class TransformTopicPipe implements PipeTransform {

  transform(value: string): string {
    return `song on ${value}`;
  }

}
