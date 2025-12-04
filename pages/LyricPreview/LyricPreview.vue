<template>
	<view class="lyrics-container">
		<scroll-view class="lyrics-scroll" scroll-y>
			<view class="lyrics-content">
				<view class="lyrics-block" v-for="(group, index) in lyricGroups" :key="index">
					<view v-for="(line, count) in group.lines">
						<text class="lyrics-line" :class="count == 0 ? 'original': 'translation'"> {{line}} </text>
					</view>
				</view>
			</view>
		</scroll-view>
		<view class="bottom-area">
			<button class="download-btn" type="primary" :loading="isDownloading" @click="handleDownload">
				<text class="btn-text">{{ isDownloading ? '下载中...' : '下载歌词' }}</text>
			</button>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from 'vue';
	import {
		onLoad,
		onShow
	} from "@dcloudio/uni-app"
	import {
		neteaseGetLyric
	} from "../../api/neteaseMusicApi.js"
	import {
		qqGetLyric
	} from "../../api/qqMusicApi.js"
	import {
		handleLyric,
		handleLyricToSrt,
		saveFile
	} from "../../api/tools.js"

	// ============ 页面数据定义 ============
	
	/** 正在下载状态 */
	const isDownloading = ref(false);
	
	/**
	 * 歌词分组数据
	 * 每个分组包含：
	 * - time: 时间戳
	 * - lines: 该时间戳对应的歌词行（原文+翻译）
	 */
	let lyricGroups = ref([
		{
			time: "",
			lines: []
		}
	])
	
	/** 原始歌词文本 */
	let lyricText = ""
	
	/** 保存的文件名 */
	let filename = ""
	
	/** 歌词格式（lrc 或 srt） */
	let lyricFormat = ref('lrc')
	
	/** 文件命名格式（artist-song, song-artist, song, artist） */
	let filenameFormat = ref('artist-song')
	
	/** 是否获取歌词翻译 */
	let getTranslation = ref(true)

	// ============ 下载功能 ============
	
	/**
	 * 处理歌词下载
	 * 将歌词文本保存为文件
	 */
	const handleDownload = async () => {
		// 防止重复下载
		if (isDownloading.value) return;
		
		isDownloading.value = true;
		uni.showLoading({
			title: "下载歌词中..."
		})

		// 调用保存文件方法
		await saveFile(lyricText, filename)

		isDownloading.value = false
		uni.hideLoading()
	};

	// ============ 歌词获取 ============
	
	/**
	 * 根据歌曲信息获取歌词
	 * @param {Object} song - 歌曲信息对象
	 * @param {string} song.platform - 平台名称（网易云音乐/QQ音乐）
	 * @param {string} song.id - 歌曲ID
	 */
	async function getSongLyric(song) {
		let lyricData = null
		
		// 根据平台调用不同的API
		if (song.platform == "网易云音乐") {
			lyricData = await neteaseGetLyric(song.id)
		} else if (song.platform == "QQ音乐") {
			lyricData = await qqGetLyric(song.id)
		}

		if (lyricData != null) {
			const lyric = lyricData['lyric']
			// 根据设置决定是否使用翻译，如果不启用翻译则传入空字符串
			const tlyric = getTranslation.value ? lyricData['tlyric'] : ''
			
			// 根据设置的格式调用不同的处理函数
			if (lyricFormat.value === 'srt') {
				// 转换为SRT格式
				lyricText = handleLyricToSrt(lyric, tlyric)
			} else {
				// 默认使用LRC格式
				lyricText = handleLyric(lyric, tlyric)
			}
		}
	}

	// ============ 生命周期钩子 ============
	
	/**
	 * 根据命名格式生成文件名
	 * @param {Object} song - 歌曲信息对象
	 * @param {string} format - 文件格式（lrc/srt）
	 * @param {string} nameFormat - 命名格式（artist-song, song-artist, song, artist）
	 * @returns {string} 文件名
	 */
	const generateFilename = (song, format, nameFormat) => {
		const artist = song.artists.replace(/ \/ /, ",")
		const songName = song.name
		
		let basename = ''
		switch (nameFormat) {
			case 'artist-song':
				basename = `${artist} - ${songName}`
				break
			case 'song-artist':
				basename = `${songName} - ${artist}`
				break
			case 'song':
				basename = songName
				break
			case 'artist':
				basename = artist
				break
			default:
				basename = `${artist} - ${songName}`
		}
		
		return `${basename}.${format}`
	}
	
	/**
	 * 页面加载时执行
	 * 1. 从本地存储读取用户设置
	 * 2. 根据设置生成文件名
	 * 3. 获取并解析歌词
	 */
	onLoad((option) => {
		// 解析传入的歌曲信息
		const song = JSON.parse(option.song)
		
		// 从本地存储加载设置
		uni.getStorage({
			key: 'appSettings',
			success: (res) => {
				const settings = res.data
				if (settings) {
					// 读取歌词格式设置，默认为 lrc
					lyricFormat.value = settings.lyricFormat || 'lrc'
					// 读取文件命名格式设置，默认为 artist-song
					filenameFormat.value = settings.filenameFormat || 'artist-song'
					// 读取翻译设置，默认为 true
					getTranslation.value = settings.getTranslation !== undefined ? settings.getTranslation : true
				}
				
				// 根据设置的格式生成文件名
				filename = generateFilename(song, lyricFormat.value, filenameFormat.value)
				
				// 显示加载提示
				uni.showLoading({
					title: '获取歌词中...'
				})
				// 获取并解析歌词
				getSongLyric(song).then(() => {
					parseLyrics(lyricText)
					uni.hideLoading()
				})
			},
			fail: () => {
				// 如果未找到设置，使用默认值
				filename = generateFilename(song, lyricFormat.value, filenameFormat.value)
				
				uni.showLoading({
					title: '获取歌词中...'
				})
				getSongLyric(song).then(() => {
					parseLyrics(lyricText)
					uni.hideLoading()
				})
			}
		})
	})

	// ============ 歌词解析 ============
	
	/**
	 * 解析歌词文本为分组结构。用于页面预览显示
	 * 将带时间戳的歌词按时间分组，每组包含原文和翻译
	 * 注意：只支持LRC格式的解析，SRT格式仅用于下载
	 * @param {string} lyricStr - 原始歌词文本
	 */
	const parseLyrics = (lyricStr) => {
		// 如果SRT格式，需要特殊处理
		if (lyricFormat.value === 'srt') {
			parseSrtLyrics(lyricStr);
			return;
		}
		
		// LRC格式解析
		const groups = [];
		let currentTime = '';

		// 逐行解析歌词
		lyricStr.split('\n').forEach(line => {
			// 匹配时间戳 [00:00.00]
			const match = line.match(/^(\[.*?\])/);
			if (match) {
				// 新的时间戳分组
				currentTime = match[1];
				groups.push({
					time: currentTime,
					lines: [line.replace(match[0], '').trim()]
				});
			} else if (currentTime && line.trim()) {
				// 将非时间戳行添加到当前分组（处理意外情况）
				groups[groups.length - 1].lines.push(line.trim());
			}
		});

		// 合并相同时间戳的分组（处理可能的重复情况）
		const merged = [];
		groups.forEach(group => {
			const last = merged[merged.length - 1];
			if (last?.time === group.time) {
				// 相同时间戳，合并到上一个分组
				last.lines.push(...group.lines);
			} else {
				// 新的时间戳，创建新分组
				merged.push(group);
			}
		});

		// 更新页面显示数据
		lyricGroups.value = merged;
	};
	
	/**
	 * 解析SRT格式歌词为分组结构
	 * SRT格式示例：
	 * 1
	 * 00:00:12,340 --> 00:00:15,230
	 * 歌词内容
	 * @param {string} srtStr - SRT格式歌词文本
	 */
	const parseSrtLyrics = (srtStr) => {
		const groups = [];
		const blocks = srtStr.split('\n\n'); // SRT用空行分隔各个字幕块
		
		for (const block of blocks) {
			const lines = block.trim().split('\n');
			if (lines.length < 3) continue; // 至少需要：序号、时间、歌词
			
			// 跳过序号行（第一行）
			const timeLine = lines[1]; // 第二行是时间行
			const lyricLines = lines.slice(2); // 从第三行开始是歌词内容
			
			// 提取开始时间作为显示的时间戳
			const timeMatch = timeLine.match(/^([\d:,]+)/);
			if (timeMatch) {
				groups.push({
					time: timeMatch[1], // 使用SRT时间格式显示
					lines: lyricLines
				});
			}
		}
		
		lyricGroups.value = groups;
	};
</script>

<style>
	page {
		height: 100%;
	}

	.lyrics-container {
		height: 100%;
		display: flex;
		flex-direction: column;
		background-color: #FFFFFF;
	}

	.lyrics-scroll {
		flex: 1;
		background-color: #F5F9FF;
		overflow: auto;
	}

	.lyrics-content {
		padding: 30rpx;
	}

	.lyrics-block {
		margin-bottom: 40rpx;
	}

	.lyrics-line {
		display: block;
		text-align: center;
	}

	.original {
		font-size: 16px;
		color: #2B5CD9;
		line-height: 60rpx;
		font-weight: 500;
	}

	.translation {
		font-size: 14px;
		color: #666666;
		line-height: 48rpx;
		font-style: italic;
	}

	.lyrics-divider {
		height: 20rpx;
	}

	.bottom-area {
		height: 200rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 30rpx;
		background-color: #FFFFFF;
		flex-shrink: 0;
	}

	.download-btn {
		width: 100%;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #4B7AE5;
		border-radius: 44rpx;
		box-shadow: 0 4rpx 12rpx rgba(75, 122, 229, 0.2);
	}

	.download-btn:active {
		transform: scale(0.98);
	}

	.btn-text {
		color: #FFFFFF;
		font-size: 16px;
		margin-left: 8rpx;
	}

	uni-button {
		margin: 0;
	}

	uni-icons {
		width: 16px;
		height: 16px;
	}
</style>