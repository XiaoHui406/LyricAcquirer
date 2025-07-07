export const qqSearchSongs = (keywords, limit) => {
	return uni.request({
		url: "https://api.vkeys.cn/v2/music/tencent/search/song?word=" + keywords + "&num=" + limit,
	}).then((res) => {
		const searchResults = res.data;
		if (searchResults != null) {
			const searchSongs = []
			const songs = searchResults['data']
			songs.forEach((song) => {
				let singers = ""
				song['singer_list'].forEach((singer) => {
					singers += " / " + singer['name']
				})
				singers = singers.slice(3)
				searchSongs.push({
					id: song['mid'],
					name: song['song'],
					artists: singers,
					album: song['album'],
					platform: "QQ音乐"
				})
			})
			return searchSongs
		} else return []
	}).catch((err) => {
		return []
	})
}

export const qqGetLyric = (songId) => {
	return uni.request({
		url: "https://api.vkeys.cn/v2/music/tencent/lyric?mid=" + songId,
	}).then((res) => {
		const lyricData = res.data['data']
		const lyric = lyricData['lrc']
		let trans = ""
		if ('trans' in lyricData && lyricData['trans'].length > 0) {
			trans = lyricData['trans']
		}
		return {
			lyric: lyric,
			tlyric: trans
		}
	})
}