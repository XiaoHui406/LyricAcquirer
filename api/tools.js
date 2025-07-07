export const handleLyric = (lyric, tlyric) => {
	if (tlyric.length == 0) return lyric.trim().replace(/\/\//g, "")

	const lyricLines = lyric.split('\n');
	const tlyricLines = tlyric.split('\n');

	const lyricMap = {};

	for (const line of lyricLines) {
		const match = line.match(/^(\[.*?\])/);
		if (match) {
			const timestamp = match[1];
			const text = line.slice(timestamp.length).trim();
			if (!lyricMap[timestamp]) {
				lyricMap[timestamp] = {
					lyric: text,
					tlyric: ''
				};
			} else {
				lyricMap[timestamp].lyric = text;
			}
		}
	}

	for (const line of tlyricLines) {
		const match = line.match(/^(\[.*?\])/);
		if (match) {
			const timestamp = match[1];
			const text = line.slice(timestamp.length).trim();
			if (!lyricMap[timestamp]) {
				lyricMap[timestamp] = {
					lyric: '',
					tlyric: text
				};
			} else {
				lyricMap[timestamp].tlyric = text;
			}
		}
	}

	const sortedTimestamps = Object.keys(lyricMap).sort();
	let output = '';

	for (const timestamp of sortedTimestamps) {
		const {
			lyric,
			tlyric
		} = lyricMap[timestamp];
		if (lyric) {
			output += `${timestamp} ${lyric}\n`;
		}
		if (tlyric) {
			output += `${timestamp} ${tlyric}\n`;
		}
	}
	return output.trim().replace(/\/\//g, "");
}

export const saveFile = async (content, filename) => {
	// #ifdef H5
	saveForH5(content, filename)
	// #endif

	// #ifdef APP-PLUS
	await saveForApp(content, filename)
	// #endif
}

const saveForH5 = (content, filename) => {
	const blob = new Blob([content], {
		type: "text/plain;charset=utf-8"
	});
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	link.click();
	URL.revokeObjectURL(link.href);
	uni.showToast({
		title: "文件已保存到下载目录"
	});
}

const saveForApp = async (content, filename) => {
	try {
		// 将内容写入文件
		const tempPath = `${plus.io.PUBLIC_DOWNLOADS}/${filename}`;
		await writeFile(tempPath, content);

		uni.showToast({
			title: `保存成功`,
			duration: 1500
		});
	} catch (error) {
		uni.showModal({
			content: "保存失败：" + error.message,
			showCancel: false
		});
	}
}

const writeFile = (path, content) => {
	return new Promise((resolve, reject) => {
		plus.io.requestFileSystem(plus.io.PUBLIC_DOWNLOADS, fs => {
			fs.root.getFile(
				path, {
					create: true
				},
				fileEntry => {
					fileEntry.createWriter(writer => {
						writer.onwriteend = resolve;
						writer.onerror = reject;
						writer.write(content);
					}, reject);
				},
				reject
			);
		}, reject);
	});
}