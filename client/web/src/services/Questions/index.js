import config from '../../config';
import { AuthService } from '../index';
import { bufferStringDecoder } from '../../tools/Network';

class QuestionService {
  constructor() {
    this.fetch = new AuthService().fetch;
    console.log('Questions, this.fetch', this.fetch);
  }

  list() {
    return this.fetch(config.questions_base, `/api/search/questions/list`);
  }

  query({ listOptions, resourceType, structureType }) {
    listOptions = !listOptions ? 'n/a' : listOptions;
    return this.fetch(
      config.questions_base,
      `/api/search/questions/query?listOptions=${listOptions}&resourceType=${resourceType}&structureType=${structureType}`,
    );
  }

  organizeResourceValues({ type, listOfResources, formResourceValues }) {
    switch (type) {
      case 'Subject':
        return formResourceValues;
      case 'Topic':
        return {
          label: formResourceValues.label,
          subject_id: listOfResources.filter(
            r =>
              r.type === 'Subject' &&
              bufferStringDecoder(r.label) === formResourceValues.subject,
          )[0].id,
        };
      case 'Question':
        return {
          content: formResourceValues.content,
          subject_id: listOfResources.filter(
            r =>
              r.type === 'Subject' &&
              bufferStringDecoder(r.label) === formResourceValues.subject,
          )[0].id,
          topic_id: listOfResources.filter(
            r =>
              r.type === 'Topic' &&
              bufferStringDecoder(r.label) === formResourceValues.topic,
          )[0].id,
          answers: [
            formResourceValues.firstAnswer,
            formResourceValues.secondAnswer,
            formResourceValues.thirdAnswer,
            formResourceValues.fourthAnswer,
          ],
        };
    }
  }

  create({ type, listOfResources, formResourceValues }) {
    console.log(type, listOfResources, formResourceValues);
    formResourceValues = this.organizeResourceValues({
      type,
      listOfResources,
      formResourceValues,
    });
    console.log('formResourceValues:::', formResourceValues);
    return this.fetch(config.questions_base, '/api/search/questions/create', {
      method: 'POST',
      body: JSON.stringify({
        type,
        ...formResourceValues,
      }),
    });
  }

  update({ resourceId, type, updatedValues }) {
    return this.fetch(
      config.questions_base,
      `/api/search/questions/update?resourceId=${resourceId}&type=${type}`,
      {
        method: 'PUT',
        updatedValues,
      },
    );
  }

  delete({ resourceId, type }) {
    return this.fetch(
      config.questions_base,
      `/api/search/questions/discard?resourceId${resourceId}&type=${type}`,
      {
        method: 'DELETE',
      },
    );
  }
}

export default QuestionService;
