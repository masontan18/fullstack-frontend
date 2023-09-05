<script>
	import '../tailwind.css';
	import { onMount } from 'svelte';
	import { themeChange } from 'theme-change';
	import { uploadMedia } from '../../utils/s3-uploader.js';
	import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';
	import plusLogo from '$lib/images/plus.png';
	import { isLogin } from '../../utils/stores.js';
	import { isLoggedIn } from '../../utils/auth.js';
	import Footer from '../components/Footer.svelte';
	import owlLogo from '$lib/images/owl.png';
	import { getUserId } from '../../utils/auth.js';
	import { goto } from '$app/navigation';

	export let data;

	async function uploadImage(evt) {
		if (evt.target['file'].files.length == 0) {
			alert('Must choose an image');
			return;
		}
		const [fileName, fileUrl] = await uploadMedia(evt.target['file'].files[0]);
		console.log(fileName, fileUrl);
		// code to make POST request to your backend
		try {
			const newImage = {
				userId: getUserId(),
				price: evt.target['price'].value,
				title: evt.target['title'].value,
				description: evt.target['description'].value,
				url: fileUrl
			};
			console.log(newImage);

			const resp = await fetch(PUBLIC_BACKEND_BASE_URL + '/image', {
				method: 'POST',
				mode: 'cors',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(newImage)
			});

			if (resp.ok) {
				const res = await resp.json();
				alert('Uploaded Image Successfully');
				evt.target['price'].value = '';
				evt.target['title'].value = '';
				evt.target['description'].value = '';
				evt.target['file'].value = '';
				goto('/manage/img-m');
			} else {
				throw 'Post image to database failed';
			}
		} catch (err) {
			console.log(err);
		}
	}

	// NOTE: the element that is using one of the theme attributes must be in the DOM on mount
	onMount(async () => {
		themeChange(false);
		// 👆 false parameter is required for svelte

		// check local storage to see if login-ed, refer function named "isLoggedIn" in auth.js
		isLogin.set(await isLoggedIn());
	});

	let enteredTitle = '';
	let titleIsValid = false;
	let titleIsTouched = false;
	$: titleHasError = !titleIsValid && titleIsTouched;
	const titleChangeHandler = (event) => {
		enteredTitle = event.target.value;
		if (enteredTitle.length >= 3) {
			titleIsValid = true;
		} else {
			titleIsValid = false;
		}
	};
	const titleBlurHandler = (event) => {
		titleIsTouched = true;
		if (enteredTitle.length >= 3) {
			titleIsValid = true;
		}
	};

	let enteredPrice = '';
	let priceIsValid = false;
	let priceIsTouched = false;
	$: priceHasError = !priceIsValid && priceIsTouched;
	const priceChangeHandler = (event) => {
		enteredPrice = event.target.value;
		if (+enteredPrice >= 0.01) {
			priceIsValid = true;
		} else {
			priceIsValid = false;
		}
	};
	const priceBlurHandler = (event) => {
		priceIsTouched = true;
		if (+enteredPrice >= 0.01) {
			priceIsValid = true;
		}
	};

	let enteredDesc = '';
	let descIsValid = false;
	let descIsTouched = false;
	$: descHasError = !descIsValid && descIsTouched;
	const descChangeHandler = (event) => {
		enteredDesc = event.target.value;
		if (enteredDesc.trim() !== '') {
			descIsValid = true;
		} else {
			descIsValid = false;
		}
	};
	const descBlurHandler = (event) => {
		descIsTouched = true;
		if (enteredDesc.trim() !== '') {
			descIsValid = true;
		}
	};

	let formIsValid = true;
	$: if (titleIsValid && priceIsValid && descIsValid) {
		formIsValid = true;
	} else {
		formIsValid = false;
	}

	const buyImage = async (id) => {
		console.log(id)
		try {
			const resp = await fetch(PUBLIC_BACKEND_BASE_URL + '/create-checkout-session', {
				method: 'POST',
				mode: 'cors',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id })
			});
			if (resp.status == 200) {
				const res = await resp.json();
				goto(res)
			}
		} catch (err) {
			console.log(err);
		}
	};
</script>

<svelte:head>
	<script src="/aws-sdk-s3.min.js"></script>
</svelte:head>

{#if $isLogin}
	<div class="image-container flex justify-end">
		<label for="upload-image-modal" class="btn btn-ghost gap-2">
			<img alt="plus-logo" src={plusLogo} class="h-10" />
			Upload image
		</label>
		<input type="checkbox" id="upload-image-modal" class="modal-toggle" />
		<label for="upload-image-modal" class="modal cursor-pointer">
			<label class="modal-box w-9/12 max-w-5xl" for>
				<form on:submit|preventDefault={uploadImage} class="w-full">
					<div class="form-control w-full mt-2">
						<input type="file" name="file" />
						<label class="label" for="file" />
					</div>
					<div class="form-control w-full">
						<label class="label" for="price">
							<span class="label-text">Price ($)</span>
						</label>
						<input
							type="number"
							step="0.01"
							name="price"
							placeholder="3.88"
							class="input input-bordered w-full"
							on:input={priceChangeHandler}
							on:blur={priceBlurHandler}
						/>
						{#if priceHasError}
							<label class="label" for="title">
								<span class="label-text-alt text-red-500">Must at larger than 0.01</span>
							</label>
						{/if}
					</div>
					<div class="form-control w-full">
						<label class="label" for="title">
							<span class="label-text">Title</span>
						</label>
						<input
							type="text"
							name="title"
							placeholder="Sunshine"
							class="input input-bordered w-full"
							on:input={titleChangeHandler}
							on:blur={titleBlurHandler}
						/>
						{#if titleHasError}
							<label class="label" for="title">
								<span class="label-text-alt text-red-500">Must at least 3 characters</span>
							</label>
						{/if}
					</div>
					<div class="form-control w-full">
						<label class="label" for="description">
							<span class="label-text">Description</span>
						</label>
						<input
							type="text"
							name="description"
							placeholder="Tell something about it"
							class="input input-bordered w-full"
							on:input={descChangeHandler}
							on:blur={descBlurHandler}
						/>
						{#if descHasError}
							<label class="label" for="title">
								<span class="label-text-alt text-red-500">Must not be empty</span>
							</label>
						{/if}
					</div>
					<div class="form-control w-full mt-2">
						<button class="btn btn-md" disabled={!formIsValid}>Upload</button>
					</div>
				</form>
			</label>
		</label>
	</div>
{/if}

{#if data.images.length === 0}
	<div class="owl-container">
		<img alt="owl-logo" src={owlLogo} class="owl-logo" />
		<p class="text-center text-xl text-red-500 phase-text">Oops ... No Item Available Now</p>
	</div>
{:else}
	<div class="content-container grid grid-rows-1 lg:grid-cols-3 gap-4">
		{#each data.images as image}
			<div class="card bg-base-100 shadow-xl">
				<figure class="h-60">
					<img alt="item" src={image.url} class="" />
				</figure>
				<div class="card-body">
					<h2>{image.title}</h2>
					<p>{image.description}</p>
					<div class="card-actions justify-end items-end">
						<h3 class="text-xl font-thin mr-4">{`USD ${image.price}`}</h3>
						<button class="btn" on:click={()=>{buyImage(image.id)}}>Buy Now</button>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}

<Footer />

<style>
	.owl-container {
		margin-top: 200px;
		margin-bottom: 250px;
	}
	.owl-logo {
		margin: 80px 45% 0;
	}
	.image-container {
		position: absolute;
		right: 0;
		top: 100px;
	}
	.content-container {
		margin-top: 150px;
		margin-bottom: 250px;
		margin-left: 85px;
		margin-right: 85px;
	}
</style>
