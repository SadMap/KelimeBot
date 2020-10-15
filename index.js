const dc = require('discord.js');
const { token, dbname } = require('./config.json');
const client = new dc.Client();
const sozluk = require('sozlukjs');
const Keyv = require('keyv');
const db = new Keyv(`sqlite://./${dbname}.sqlite`);
db.on('error', err => console.error('Keyv connection error:', err));
const chars = 'abcçdefghıijklmnoöprsştuüvyz';
const string_length = 1;
let randomstring = '';
for (let i = 0; i < string_length; i++) {
	const rnum = Math.floor(Math.random() * chars.length);
	randomstring += chars.substring(rnum, rnum + 1);
}
client.on('guildCreate', async guildo => {
	db.set(`prefix.${guildo.id}`, '-');
});
client.on('message', async message => {
	if (message.author.bot) return;
	db.get(`Okanal.${message.guild.id}`).then(r => {
		if (message.channel.id == r) {
			db.get(`Oilkharf.${message.guild.id}`).then(r2 => {
				if (message.content.startsWith(r2)) {
					sozluk.TDKDictionary.getMeaningData(message.content)
						.then(data => {
							if (data.error == 'Sonuç bulunamadı') {
								message.delete();
								message.channel.send('Hocam Öyle Kelime yok').then(m => {
									const ms = '20000';
									m.delete({ timeout: ms });
								});
							}
							else if (data[0].madde_id) {
								db.get(`Kelimeler.${message.guild.id}`).then(rr => {
									if (rr == 'undefined') {
										const ar = new Array(message.content);
										db.set(`Kelimeler.${message.guild.id}`, ar);
									}
									else if (rr.includes(message.content)) {
										message.delete();
										message.channel.send(`${message.content} daha önce kullanılmış`).then(m2 => {
											const ms = '20000';
											m2.delete({ timeout: ms });
										});
									}
									else {
										db.get(`Sonkisi.${message.guild.id}`).then(rrr => {
											if (rrr == 'undefined') {
												db.set(`Sonkisi.${message.guild.id}`, message.author.id);
											}
											else if (rrr !== message.author.id) {
												message.react('✅');
												Array.prototype.push.apply(rr, message.content);
												db.set(`Oilkharf.${message.guild.id}`, message.content.slice(-1));
												db.set(`Kelimeler.${message.guild.id}`, rr);
												db.set(`Sonkisi.${message.guild.id}`, message.author.id);
											}
											else if (rrr == message.author.id) {
												message.channel.send('Aynı Kişi Arka Arkaya Kelime Söyleyemez');
											}
										});
										message.react('✅');
										Array.prototype.push.apply(rr, message.content);
										db.set(`Oilkharf.${message.guild.id}`, message.content.slice(-1));
										db.set(`Kelimeler.${message.guild.id}`, rr);
									}
								});
							}
						});
				}
			});
		}
	});
	let args;
	// handle messages in a guild
	if (message.guild) {
		let prefix;

		if (message.content.startsWith('eqwwwqew')) {
			prefix = 'eqwwwqew';
		}
		else {
			const guildPrefix = await db.get(`prefix.${message.guild.id}`);
			if (message.content.startsWith(guildPrefix)) prefix = guildPrefix;
		}

		// if we found a prefix, setup args; otherwise, this isn't a command
		if (!prefix) return;
		args = message.content.slice(prefix.length).trim().split(/\s+/);
	}
	else {
		// handle DMs
		message.channel.send('https://discord.com/oauth2/authorize?client_id=765519752947826708&permissions=0&scope=bot');
	}

	const command = args.shift().toLowerCase();
	function getUserFromMention(mention) {
		if (!mention) return;

		if (mention.startsWith('<#') && mention.endsWith('>')) {
			mention = mention.slice(2, -1);

			if (mention.startsWith('!')) {
				mention = mention.slice(1);
			}

			return mention;
		}
	}
	if (command === 'prefix') {
		if (args.length) {
			if (message.member.hasPermission('MANAGE_GUILD')) {
				await db.set('prefix.' + message.guild.id, args[0]);
				return message.channel.send(`Başarıyla prefixi \`${args[0]}\` olarak değiştirdin`);
			}
			else {
				return message.channel.send('Yetersiz Yetki');
			}
		}

		return message.channel.send(`Prefix is \`${await db.get('prefix.' + message.guild.id)}\``);
	}
	if (command == 'oyna') {
		if (args.length) {
			if (message.member.hasPermission('MANAGE_GUILD')) {
				console.log(getUserFromMention(args[0]));
				const e = randomstring;
				db.set(`Okanal.${message.guild.id}`, getUserFromMention(args[0]));
				db.get(`Okanal.${message.guild.id}`).then(r => {
					client.channels.cache.get(r).send(`İlk Harfimiz ${e} İyi Oyunlar dilerim`);
					db.set(`Oilkharf.${message.guild.id}`, e);
				},
				);
			}
		}
	}


});
client.login(token);