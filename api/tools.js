/**
 * 处理歌词文本，合并原文和翻译（LRC格式）
 * @param {string} lyric - 原文歌词
 * @param {string} tlyric - 翻译歌词
 * @returns {string} 合并后的LRC格式歌词文本
 */
export const handleLyric = (lyric, tlyric) => {
	// 如果没有翻译，直接返回原文并去除双斜线
	if (tlyric.length == 0) return lyric.trim().replace(/\/\//g, "")

	// 按行分割原文和翻译歌词
	const lyricLines = lyric.split('\n');
	const tlyricLines = tlyric.split('\n');

	// 创建时间戳映射表，存储每个时间戳对应的原文和翻译
	const lyricMap = {};

	// 解析原文歌词，建立时间戳到歌词的映射
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

	// 解析翻译歌词，将翻译添加到对应时间戳
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

	// 按时间戳排序
	const sortedTimestamps = Object.keys(lyricMap).sort();
	let output = '';

	// 按顺序组合原文和翻译
	for (const timestamp of sortedTimestamps) {
		const {
			lyric,
			tlyric
		} = lyricMap[timestamp];
		// 如果有原文，添加原文行
		if (lyric) {
			output += `${timestamp} ${lyric}\n`;
		}
		// 如果有翻译，添加翻译行
		if (tlyric) {
			output += `${timestamp} ${tlyric}\n`;
		}
	}
	// 去除首尾空白和双斜线
	return output.trim().replace(/\/\//g, "");
}

/**
 * 将LRC时间戳转换为SRT时间戳格式
 * LRC格式: [mm:ss.xx]
 * SRT格式: hh:mm:ss,xxx
 * @param {string} lrcTime - LRC格式时间戳，如 [00:12.34]
 * @returns {string} SRT格式时间戳，如 00:00:12,340
 */
const lrcTimeToSrtTime = (lrcTime) => {
	// 移除方括号并解析时间
	const timeStr = lrcTime.replace(/[\[\]]/g, '');
	const parts = timeStr.split(':');
	if (parts.length !== 2) return '00:00:00,000';
	
	const minutes = parseInt(parts[0]) || 0;
	const secParts = parts[1].split('.');
	const seconds = parseInt(secParts[0]) || 0;
	const centiseconds = parseInt(secParts[1]) || 0;
	
	// 计算总时间（转换为小时、分钟、秒）
	const totalSeconds = minutes * 60 + seconds;
	const hours = Math.floor(totalSeconds / 3600);
	const mins = Math.floor((totalSeconds % 3600) / 60);
	const secs = totalSeconds % 60;
	const milliseconds = centiseconds * 10; // 百分之一秒转毫秒
	
	// 格式化为 hh:mm:ss,xxx
	return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
}

/**
 * 处理歌词文本，合并原文和翻译（SRT格式）
 * @param {string} lyric - 原文歌词
 * @param {string} tlyric - 翻译歌词
 * @returns {string} 合并后的SRT格式歌词文本
 */
export const handleLyricToSrt = (lyric, tlyric) => {
	// 如果没有翻译，只处理原文
	const hasTranslation = tlyric && tlyric.length > 0;
	
	// 按行分割原文和翻译歌词
	const lyricLines = lyric.split('\n');
	const tlyricLines = hasTranslation ? tlyric.split('\n') : [];
	
	// 创建时间戳映射表，存储每个时间戳对应的原文和翻译
	const lyricMap = {};
	
	// 解析原文歌词，建立时间戳到歌词的映射
	for (const line of lyricLines) {
		const match = line.match(/^(\[.*?\])/);
		if (match) {
			const timestamp = match[1];
			const text = line.slice(timestamp.length).trim();
			// 过滤掉空行和元数据
			if (text && !text.startsWith('[')) {
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
	}
	
	// 解析翻译歌词，将翻译添加到对应时间戳
	if (hasTranslation) {
		for (const line of tlyricLines) {
			const match = line.match(/^(\[.*?\])/);
			if (match) {
				const timestamp = match[1];
				const text = line.slice(timestamp.length).trim();
				if (text && !text.startsWith('[')) {
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
		}
	}
	
	// 按时间戳排序
	const sortedTimestamps = Object.keys(lyricMap).sort();
	
	// 构建SRT格式输出
	let output = '';
	let index = 1;
	
	for (let i = 0; i < sortedTimestamps.length; i++) {
		const timestamp = sortedTimestamps[i];
		const nextTimestamp = sortedTimestamps[i + 1];
		
		const { lyric: lyricText, tlyric: tlyricText } = lyricMap[timestamp];
		
		// 跳过空内容
		if (!lyricText && !tlyricText) continue;
		
		// 序号
		output += `${index}\n`;
		
		// 时间范围：开始时间 --> 结束时间
		const startTime = lrcTimeToSrtTime(timestamp);
		// 如果有下一个时间戳，使用它作为结束时间；否则默认加3秒
		let endTime;
		if (nextTimestamp) {
			endTime = lrcTimeToSrtTime(nextTimestamp);
		} else {
			// 最后一句歌词，默认持续3秒
			const lastTimeParts = startTime.split(/[:,]/);
			const hours = parseInt(lastTimeParts[0]);
			const mins = parseInt(lastTimeParts[1]);
			const secs = parseInt(lastTimeParts[2]) + 3;
			const ms = lastTimeParts[3];
			
			const newSecs = secs % 60;
			const newMins = mins + Math.floor(secs / 60);
			const newHours = hours + Math.floor(newMins / 60);
			const finalMins = newMins % 60;
			
			endTime = `${String(newHours).padStart(2, '0')}:${String(finalMins).padStart(2, '0')}:${String(newSecs).padStart(2, '0')},${ms}`;
		}
		
		output += `${startTime} --> ${endTime}\n`;
		
		// 歌词内容（原文和翻译）
		if (lyricText) {
			output += `${lyricText}\n`;
		}
		if (tlyricText) {
			output += `${tlyricText}\n`;
		}
		
		// 空行分隔
		output += '\n';
		index++;
	}
	
	return output.trim();
}

/**
 * 保存文件到本地
 * 根据不同平台调用不同的保存方法
 * @param {string} content - 文件内容
 * @param {string} filename - 文件名
 */
export const saveFile = async (content, filename) => {
	// #ifdef H5
	saveForH5(content, filename)
	// #endif

	// #ifdef APP-PLUS
	await saveForApp(content, filename)
	// #endif
}

/**
 * H5平台保存文件
 * 创建下载链接触发浏览器下载
 * @param {string} content - 文件内容
 * @param {string} filename - 文件名
 */
const saveForH5 = (content, filename) => {
	// 创建Blob对象
	const blob = new Blob([content], {
		type: "text/plain;charset=utf-8"
	});
	// 创建下载链接
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	// 触发下载
	link.click();
	// 释放URL对象
	URL.revokeObjectURL(link.href);
	// 显示成功提示
	uni.showToast({
		title: "文件已保存到下载目录"
	});
}

/**
 * APP平台保存文件
 * 使用plus API保存到下载目录
 * @param {string} content - 文件内容
 * @param {string} filename - 文件名
 */
const saveForApp = async (content, filename) => {
	try {
		// 构建文件路径（下载目录）
		const tempPath = `${plus.io.PUBLIC_DOWNLOADS}/${filename}`;
		// 写入文件
		await writeFile(tempPath, content);

		// 显示成功提示
		uni.showToast({
			title: `保存成功`,
			duration: 1500
		});
	} catch (error) {
		// 显示错误信息
		uni.showModal({
			content: "保存失败：" + error.message,
			showCancel: false
		});
	}
}

/**
 * 写入文件内容
 * 使用plus文件系统API写入文件
 * @param {string} path - 文件路径
 * @param {string} content - 文件内容
 * @returns {Promise} 写入完成的Promise
 */
const writeFile = (path, content) => {
	return new Promise((resolve, reject) => {
		// 请求文件系统
		plus.io.requestFileSystem(plus.io.PUBLIC_DOWNLOADS, fs => {
			// 获取文件对象
			fs.root.getFile(
				path, {
					create: true
				},
				fileEntry => {
					// 创建写入器
					fileEntry.createWriter(writer => {
						writer.onwriteend = resolve;
						writer.onerror = reject;
						// 写入内容
						writer.write(content);
					}, reject);
				},
				reject
			);
		}, reject);
	});
}