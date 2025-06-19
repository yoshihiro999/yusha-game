const fs = require('fs');

const parties = JSON.parse(fs.readFileSync('data/hero_parties.json', 'utf8'));

const roleTemplates = {
  "勇者": ["ここが正念場だ！", "みんな、ついてこい！"],
  "戦士": ["壁は任せろ！", "まだまだいけるぞ！"],
  "忍者": ["影から支援する！", "すばやく片づける！"],
  "弓使い": ["矢は無駄にしない！", "遠距離から援護する！"],
  "魔法使い": ["魔法の威力を見よ！", "詠唱、始めるよ！"],
  "格闘家": ["拳で語る！", "力任せに行くぜ！"],
  "盗賊": ["宝はいただく！", "罠は任せてくれ！"],
  "僧侶": ["仲間を癒す！", "光の加護を！"],
};

const updated = parties.map(party => {
  const lines = [];
  party.members.forEach(m => {
    lines.push(`${m.role}: ${party.concept}、行くぞ！`);
  });
  party.members.forEach(m => {
    const t = roleTemplates[m.role] || ["頑張ろう！", "負けられない！"];
    lines.push(`${m.role}: ${t[0]}`);
  });
  party.members.forEach(m => {
    const t = roleTemplates[m.role] || ["頑張ろう！", "負けられない！"];
    lines.push(`${m.role}: ${t[1]}`);
  });
  const file = `data/battle_chat/${party.team}.json`;
  fs.writeFileSync(file, JSON.stringify(lines, null, 2));
  delete party.battle_chat;
  party.battle_chat_file = file.replace('data/', '');
  return party;
});

fs.writeFileSync('data/hero_parties.json', JSON.stringify(updated, null, 2));
