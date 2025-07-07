export const neteaseSearchSongs = (keywords, limit) => {
	return uni.request({
		url: "https://apis.netstart.cn/music/search?keywords=" + keywords + "&limit=" + limit
	}).then((res) => {
		let searchResults = res.data;
		if (searchResults != null) {
			let searchSongs = []
			let songs = searchResults["result"]["songs"];
			songs.forEach((song) => {
				let artists = "";
				song['artists'].forEach((artist) => {
					artists += " / " + artist['name']
				})
				artists = artists.slice(3)
				searchSongs.push({
					id: song['id'],
					name: song['name'],
					artists: artists,
					album: song['album']['name'],
					platform: "网易云音乐"
				});
			})
			return searchSongs
		} else return []
	}).catch((err) => {
		return []
	})
}

export const neteaseGetLyric = (songId) => {
	return uni.request({
		url: "https://apis.netstart.cn/music/lyric?id=" + songId
	}).then((res) => {
		let lyricData = res.data
		let lyric = lyricData['lrc']['lyric']
		let tlyric = ""
		if ('tlyric' in lyricData && lyricData['tlyric']['lyric'].length > 0) {
			tlyric = lyricData['tlyric']['lyric']
		}
		return {
			lyric: lyric,
			tlyric: tlyric
		}
	})
}