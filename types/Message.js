const User = require('./User.js');
const Attachment = require('./Attachment.js')
const Collection = require('../djs-collection');
const Member = require('./Member.js');

module.exports = class Message {
  constructor(client, data={}) {
    this.id = data.id;
    this.content = data.content;
    this.room = client.rooms.get(data.room_id);
    this.author = new User(client, data.author);
    this.mentions = new Collection();
    if (data.attachment) this.attachment = new Attachment(client, data.attachment);
    if (data.house_id) this.house = client.houses.get(data.house_id);
    if (data.member && this.house) this.member = new Member(client, data.member);
    this.timestamp = data.timestamp;
    this.client = client;

    if (data.mentions) {
      for (let m of data.mentions) {
        const mention = new User(client, m);
        this.mentions.set(mention.id, mention);
      }
    }
  }


  async edit(content) {
    const res = await this.client.axios.patch(`/rooms/${this.room.id}/messages/${this.id}`, {
      content: content
    });
    if (res.data.success) {
      this.content = content;
      return this;
    }
    return false;
  }

  async read() {
    const res = await this.client.axios.post(`/rooms/${this.room.id}/messages/${this.id}`);
    if ([ 200, 204 ].includes(res.status)) {
      return true;
    }
    return false;
  }

  async delete() {
    const res = await this.client.axios.delete(`/rooms/${this.room.id}/messages/${this.id}`);
    if ([ 200, 204 ].includes(res.status)) {
      return true;
    }
    return false;
  }

  _update(data) {
    this.content = data.content;
    this.room = this.client.rooms.get(data.room_id);
    this.author = new User(this.client, data.author);
    if (data.attachment) this.attachment = new Attachment(this.client, data.attachment);
    this.timestamp = data.timestamp;

    if (data.mentions) {
      const mentions = new Collection();
      for (let m of data.mentions) {
        const mention = this.mentions.get(m.id) || new User(this.client, m);
        mentions.set(mention.id, mention);
      }
      this.mentions = mentions;
    }

    return this;
  }
}
