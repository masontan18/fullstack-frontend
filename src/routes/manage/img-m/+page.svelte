<script>
	export let data;
	import Footer from '../../../components/Footer.svelte';
	import '../../../tailwind.css';
	import { themeChange } from 'theme-change';
	import { onMount } from 'svelte';
	import { isLoggedIn } from '../../../../utils/auth.js';
	import { isLogin } from '../../../../utils/stores.js';
	import cryLogo from '$lib/images/cry.png';
	import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';
	import { getTokenFromLocalStorage } from '../../../../utils/auth.js';
	import { goto } from '$app/navigation';

	onMount(async () => {
		themeChange(false);
		// 👆false parameter is required for svelte
		isLogin.set(await isLoggedIn());
	});
</script>

<h1>All Your Listing(s)</h1>
{#if data.images.length == 0}
	<div>
		<img alt="cry-logo" src={cryLogo} class="cry-logo" />
		<div class="flex flex-row justify-center phase-container">
			<a class="text-center text-xs text-red-500 link-hover italic" href="/"
				>No Listing? Create One!</a
			>
		</div>
	</div>
{:else}
	<div class="big-container">
		{#each data.images as image}
			<a class="each-job-container btn-outline btn-accent" href="/manage/img-edit/{image.id}">
				<img src={image.url} alt="item" class="user-image" />
				<div>Title: <span class="special-font">{image.title}</span></div>
				<div>Desccription: <span class="special-font">{image.description}</span></div>
				<div>Price: <span class="special-font">{image.price}</span></div>
			</a>
		{/each}
	</div>
{/if}

<Footer />

<style>
	.big-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
	}

	.big-container a {
		width: 30%;
	}

	.each-job-container {
		width: auto;
		margin: 15px;
		border-radius: 50%;
	}

	.cry-logo {
		margin: 50px 45% 0;
	}

	h1 {
		margin-top: 100px;
		text-align: center;
		font-size: 35px;
		margin-bottom: 25px;
		font-family: Cambria;
	}

	.phase-container {
		margin-top: 10px;
	}

	.special-font {
		margin-left: 10px;
	}

	.user-image {
		height: 50px;
	}
</style>
