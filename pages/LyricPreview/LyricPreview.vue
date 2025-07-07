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
		saveFile
	} from "../../api/tools.js"

	const isDownloading = ref(false);
	let lyricGroups = ref([
		{
			time: "",
			lines: []
		}
	])
	let lyricText = ""
	let filename = ""

	const handleDownload = async () => {
		if (isDownloading.value) return;
		isDownloading.value = true;
		uni.showLoading({
			title: "下载歌词中..."
		})

		await saveFile(lyricText, filename)

		isDownloading.value = false
		uni.hideLoading()
	};

	async function getSongLyric(song) {
		let lyricData = null
		if (song.platform == "网易云音乐") {
			lyricData = await neteaseGetLyric(song.id)
		} else if (song.platform == "QQ音乐") {
			lyricData = await qqGetLyric(song.id)
		}

		if (lyricData != null) {
			const lyric = lyricData['lyric']
			const tlyric = lyricData['tlyric']
			const translateLyric = handleLyric(lyric, tlyric)
			lyricText = translateLyric
		}
	}

	onLoad((option) => {
		const song = JSON.parse(option.song)
		filename = song.artists.replace(/ \/ /, ",") + " - " + song.name + ".lrc"
		uni.showLoading({
			title: '获取歌词中...'
		})
		getSongLyric(song).then(() => {
			parseLyrics(lyricText)
			uni.hideLoading()
		})
	})

	// 解析歌词为分组结构
	const parseLyrics = (lyricStr) => {
		const groups = [];
		let currentTime = '';

		lyricStr.split('\n').forEach(line => {
			const match = line.match(/^(\[.*?\])/);
			if (match) {
				// 新时间戳分组
				currentTime = match[1];
				groups.push({
					time: currentTime,
					lines: [line.replace(match[0], '').trim()]
				});
			} else if (currentTime && line.trim()) {
				// 添加到当前分组（处理意外情况）
				groups[groups.length - 1].lines.push(line.trim());
			}
		});

		// 合并相同时间戳的分组（处理可能的重复情况）
		const merged = [];
		groups.forEach(group => {
			const last = merged[merged.length - 1];
			if (last?.time === group.time) {
				last.lines.push(...group.lines);
			} else {
				merged.push(group);
			}
		});

		lyricGroups.value = merged;
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