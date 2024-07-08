import {Database, Model, Q, Query, Relation} from '@nozbe/watermelondb';
import {
  action,
  children,
  field,
  lazy,
  relation,
  text,
} from '@nozbe/watermelondb/decorators';

export class Post extends Model {
  static table = 'posts';
  static associations = {
    comments: {type: 'has_many', foreignKey: 'post_id'},
  };

  @text('title') title;
  @text('subtitle') subtitle;
  @text('body') body;
  @field('is_pinned') isPinned;
}

export class Comment extends Model {
  static table = 'comments';
  static associations = {
    posts: {type: 'belongs_to', key: 'post_id'},
  };

  @text('body') body;
  @text('post_id') post_id;
}
