<template>
	<view class="container" @click.stop="closeMenu">
		<view class="custom-navbar">
			<view class="navbar-more"></view>
			<view class="navbar-title">歌词搜索</view>
			<view class="navbar-more" @click.stop="toggleMenu">
				<view class="more-icon">
					<view class="dot"></view>
					<view class="dot"></view>
					<view class="dot"></view>
				</view>
			</view>
			<!-- 功能菜单 -->
			<view v-if="showMenu" class="menu-popup" @click.stop="closeMenu">
				<view class="menu-item" @click="handleMenuClick('setting')">
					<image src="/static/settings.png" class="menu-item-image" mode="widthFix"></image>
					<view class="menu-item-text">设置</view>
				</view>
				<view class="menu-item" @click="handleMenuClick('about')">
					<image src="/static/info.png" class="menu-item-image" mode="widthFix"></image>
					<view class="menu-item-text">关于</view>
				</view>
			</view>
		</view>
		<!-- 搜索区域 -->
		<view class="search-section">
			<view class="search-form">
				<view class="input-group">
					<input v-model="songInfo" placeholder="请输入歌曲信息" class="input" />
					<button type="primary" @click="handleSearch" class="search-btn">
						搜索
					</button>
				</view>
			</view>
		</view>
		<!-- 搜索结果区域 -->
		<view class="result-section">
			<view class="result-list" v-if="searchSongs.length">
				<view v-for="(item, index) in searchSongs" :key="item.id" class="result-card"
					@click="toLyricPreview(item)">
					<view class="card-header">
						<view class="song-name">{{ item.name }}</view>
						<view class="platform-tag">
							<image :src="getPlatformIcon(item.platform)" class="platform-icon"></image>
							<text>{{ item.platform }}</text>
						</view>
					</view>
					<view class="card-content">
						<view class="info-item">
							<text class="label">歌手：</text>
							<text class="value">{{ item.artists }}</text>
						</view>
						<view class="info-item">
							<text class="label">专辑：</text>
							<text class="value">{{ item.album }}</text>
						</view>
					</view>
				</view>
			</view>
			<view v-else class="no-result">
				<image src="/static/searchInfo.png" class="no-result-icon"></image>
				<text>暂无搜索结果</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from "vue";
	import {
		neteaseSearchSongs
	} from "../../api/neteaseMusicApi.js"
	import {
		qqSearchSongs
	} from "../../api/qqMusicApi.js"

	let searchSongs = ref([])
	const songInfo = ref('');
	const artistName = ref('');
	const songUrl = ref('');
	const neteaseLimit = 5
	const qqLimit = 5

	async function handleSearch() {
		if (songInfo.value.length == 0) return
		uni.showLoading({
			title: '搜索中...'
		})

		searchSongs.value.splice(0, searchSongs.value.length)

		const neteaseSongs = await neteaseSearchSongs(songInfo.value, neteaseLimit)
		const qqSongs = await qqSearchSongs(songInfo.value, qqLimit)
		neteaseSongs.forEach((song) => {
			searchSongs.value.push(song)
		})
		qqSongs.forEach((song) => {
			searchSongs.value.push(song)
		})

		uni.hideLoading()
	};

	async function toLyricPreview(song) {
		uni.navigateTo({
			url: "/pages/LyricPreview/LyricPreview?song=" + JSON.stringify(song)
		})
	}

	const getPlatformIcon = (platform) => {
		switch (platform) {
			case '网易云音乐':
				return '/static/netease.png';
			case 'QQ音乐':
				return '/static/qq.png';
			case '酷狗音乐':
				return '/static/kugou.png'
			default:
				return 'spinner-cycle';
		}
	}

	const showMenu = ref(false);

	const toggleMenu = () => {
		showMenu.value = !showMenu.value;
	};

	const closeMenu = () => {
		showMenu.value = false;
	};

	const handleMenuClick = (type) => {
		closeMenu();
		if (type === 'setting') {
			uni.navigateTo({
				url: '/pages/settings/settings'
			});
		} else if (type === 'about') {
			uni.navigateTo({
				url: '/pages/about/about'
			});
		}
	};
</script>

<style scoped>
	page {
		height: 100%;
	}

	.custom-navbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 100rpx;
		background-color: #f8f8f8;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30rpx;
		z-index: 1000;
	}

	.navbar-title {
		font-size: 36rpx;
		font-weight: 550;
		color: #333;
	}

	.navbar-more {
		padding: 16rpx;
		width: 8rpx;
	}

	.more-icon {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.dot {
		width: 8rpx;
		height: 8rpx;
		background-color: #666;
		border-radius: 50%;
	}

	/* 功能菜单 */
	.menu-popup {
		position: absolute;
		right: 30rpx;
		top: 100rpx;
		background: #fff;
		border-radius: 12rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.12);
		min-width: 160rpx;
		z-index: 1001;
	}

	.menu-item {
		padding: 24rpx 32rpx;
		font-size: 28rpx;
		color: #333;
		border-bottom: 1rpx solid #eee;
		align-items: center;
		gap: 10rpx;
		justify-content: center;
		display: flex;
		flex-direction: row;
	}

	.menu-item-image {
		width: 40rpx;
	}

	.menu-item-text {
		font-size: 35rpx;
	}

	.menu-item:last-child {
		border-bottom: none;
	}

	.menu-item:active {
		background-color: #f5f5f5;
	}

	.container {
		background-color: #FFFFFF;
		padding: 30rpx;
		padding-top: 120rpx;
		display: flex;
		flex-direction: column;
		height: 100%;
		box-sizing: border-box;
	}

	.search-section {
		background-color: #E6F3FF;
		padding: 30rpx;
		border-radius: 16rpx;
		margin-bottom: 30rpx;
		flex-shrink: 0;
	}

	.title {
		font-size: 36rpx;
		color: #1890FF;
		font-weight: bold;
		margin-bottom: 30rpx;
	}

	.search-form {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.input-group {
		display: flex;
		gap: 20rpx;
	}

	.input {
		flex: 1;
		background-color: #FFFFFF;
		border-radius: 8rpx;
		padding: 10px;
	}

	.exact-search-section {
		background-color: #E6F3FF;
		padding: 30rpx;
		border-radius: 16rpx;
		margin-bottom: 30rpx;
		flex-shrink: 0;
	}

	.subtitle {
		font-size: 32rpx;
		color: #1890FF;
		font-weight: bold;
		margin-bottom: 20rpx;
	}

	.url-input {
		flex: 1;
		background-color: #FFFFFF;
		border-radius: 8rpx;
		padding: 10px;
	}

	.search-btn {
		flex-shrink: 0;
		font-size: 15px;
		/* width: 160rpx; */
		margin: 0;
	}

	.result-section {
		background-color: #FFFFFF;
		border-radius: 16rpx;
		overflow: hidden;
		flex: 1;
		overflow-y: auto;
	}

	.result-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		padding: 20rpx;
		/* min-height: 100%; */
	}

	.result-card {
		background-color: #FFFFFF;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.12);
		padding: 24rpx;
		border: 2rpx solid #E6F3FF;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.song-name {
		font-size: 32rpx;
		color: #333333;
		font-weight: 500;
		flex: 1;
		max-lines: 1;
		text-overflow: ellipsis;
	}

	.platform-tag {
		display: flex;
		align-items: center;
		gap: 8rpx;
		background-color: #E6F3FF;
		padding: 8rpx 16rpx;
		border-radius: 24rpx;
	}

	.platform-tag text {
		font-size: 24rpx;
		color: #1890FF;
	}

	.platform-icon {
		width: 16px;
		height: 16px;
	}

	.card-content {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.info-item {
		display: flex;
		align-items: center;
	}

	.label {
		font-size: 28rpx;
		color: #666666;
		width: 100rpx;
		flex-shrink: 0;
	}

	.value {
		font-size: 28rpx;
		color: #333333;
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.no-result {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60rpx 0;
		color: #999999;
		gap: 20rpx;
	}

	.no-result-icon {
		width: 30px;
		height: 30px;
	}
</style>