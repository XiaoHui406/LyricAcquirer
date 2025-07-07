<template>
	<view class="about-container">
		<view class="app-info-card">
			<view class="app-icon">
				<image src="/static/logo.png" mode="aspectFill"></image>
			</view>
			<view class="app-name">歌词获取</view>
			<view class="app-version">v1.0.0</view>
			<view class="app-desc">
				歌词获取助手是一款专为音乐爱好者打造的歌词获取工具，支持网易云音乐和QQ音乐的歌曲搜索，提供歌词预览与下载功能，让你随时随地享受精准歌词服务。
			</view>
		</view>
	</view>
</template>

<script setup>

</script>

<style scoped>
	.about-container {
		background-color: #f8f8f8;
		height: 100%;
	}

	.app-info-card {
		background-color: #fff;
		padding: 20px 15px;
		text-align: center;
		margin-bottom: 15px;
		height: 100%;
	}

	.app-icon {
		width: 80px;
		height: 80px;
		margin: 0 auto 10px;
		border-radius: 15px;
		overflow: hidden;
	}

	.app-icon image {
		width: 100%;
		height: 100%;
	}

	.app-name {
		font-size: 20px;
		font-weight: bold;
		margin-bottom: 5px;
	}

	.app-version {
		font-size: 14px;
		color: #888;
		margin-bottom: 15px;
	}

	.app-desc {
		font-size: 14px;
		color: #666;
		line-height: 1.5;
		padding: 0 15px;
	}
</style>