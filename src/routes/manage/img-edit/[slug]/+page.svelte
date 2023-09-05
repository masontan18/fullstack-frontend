<script>
	import Footer from '../../../../components/Footer.svelte';
	import '../../../../tailwind.css';
	import { themeChange } from 'theme-change';
	import { onMount } from 'svelte';
	export let data;
	import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';
	import { goto } from '$app/navigation';
	import { isLoggedIn } from '../../../../../utils/auth.js';
	import { isLogin } from '../../../../../utils/stores.js';
	import { getTokenFromLocalStorage } from '../../../../../utils/auth.js';

	onMount(async () => {
		themeChange(false);
		// 👆 false parameter is required for svelte
		isLogin.set(await isLoggedIn());
	});

	const deleteHandler = async (event) => {
		const value = confirm('Confirm to delete this listing?');
		if (value) {
			const resp = await fetch(PUBLIC_BACKEND_BASE_URL + '/image', {
				method: 'DELETE',
				mode: 'cors',
				headers: {
					'Content-Type': 'application/json',
					Authorization: getTokenFromLocalStorage()
				},
				body: JSON.stringify({ id: data.image.id })
			});
			if (resp.ok) {
				alert('Delete Successfully');
				goto('/manage/img-m');
			} else {
				alert('Failed');
			}
		}
	};

	let isLoading = false;
	$: buttonClass = `btn btn-md btn-outline btn-accent login-btn ${isLoading ? 'btn--loading' : ''}`;
	const submitHandler = async (event) => {
		isLoading = true;
		event.preventDefault();

		const userData = {
			id: data.image.id,
			price: event.target["price"].value,
			title: event.target["title"].value,
			description: event.target["description"].value
		};

		const resp = await fetch(
			PUBLIC_BACKEND_BASE_URL + '/image',
			{
				method: 'PUT',
				mode: 'cors',
				headers: {
					'Content-Type': 'application/json',
					Authorization: getTokenFromLocalStorage()
				},
				body: JSON.stringify(userData)
			}
		);
		if (resp.ok) {
			isLoading = false;
			alert('Updated successfully');
			goto('/');
		} else {
			isLoading = false;
			alert('Update failed');
		}
	};



	let enteredTitle = '';
	let titleIsValid = true;
	const titleChangeHandler = (event) => {
		enteredTitle = event.target.value;
		if (enteredTitle.length >= 3) {
			titleIsValid = true;
		} else {
			titleIsValid = false;
		}
	};

	let enteredPrice = '';
	let priceIsValid = true;
	const priceChangeHandler = (event) => {
		enteredPrice = event.target.value;
		if (+enteredPrice >= 0.01) {
			priceIsValid = true;
		} else {
			priceIsValid = false;
		}
	};

	let enteredDesc = '';
	let descIsValid = true;
	const descChangeHandler = (event) => {
		enteredDesc = event.target.value;
		if (enteredDesc.trim() !== '') {
			descIsValid = true;
		} else {
			descIsValid = false;
		}
	};

	let formIsValid = true;
	$: if (
		titleIsValid &&
		priceIsValid &&
		descIsValid
	) {
		formIsValid = true;
	} else {
		formIsValid = false;
	}
</script>

<div class="flex flex-row justify-end align-bottom delete-button-container">
	<button class="btn btn-md btn-outline btn-error" on:click={deleteHandler}>Delete</button>
</div>

<div class="container mx-auto px-2 lg:px-0">
	<form class="text-xl" on:submit={submitHandler}>
		<div class="form-control w-full form-input-div">
			<label class="label" for="title">Title</label>
			<input
				class="form-input"
				type="text"
				name="title"
				value={data.image.title}
				on:input={titleChangeHandler}
			/>
			{#if !titleIsValid}
				<label class="label" for="title">
					<span class="label-text-alt text-red-500">Must at least 3 characters</span>
				</label>
			{/if}
		</div>
		<div class="form-control w-full form-input-div">
			<label class="label" for="price">Price ($)</label>
			<input
				class="form-input"
				type="number"
				step="0.01"
				name="price"
				value={data.image.price}
				on:input={priceChangeHandler}
			/>
			{#if !priceIsValid}
				<label class="label" for="price">
					<span class="label-text-alt text-red-500"> Must be larger than 0.01</span>
				</label>
			{/if}
		</div>
		<div class="form-control w-full form-input-div">
			<label class="label" for="description">Description</label>
			<input
				class="form-input"
				type="text"
				name="description"
				value={data.image.description}
				on:input={descChangeHandler}
			/>
			{#if !descIsValid}
				<label class="label" for="description">
					<span class="label-text-alt text-red-500">Must not be empty</span>
				</label>
			{/if}
		</div>
		
		<div class="flex flex-row justify-center align-bottom">
			<button class={buttonClass} disabled={!formIsValid}
				><span class="btn-text">Submit</span></button
			>
		</div>
	</form>
</div>

<Footer />

<style>
	.form-input {
		background-color: rgb(170, 178, 178);
		font-size: large;
		border-radius: 10px;
		color: black;
	}

	.form-textarea {
		background-color: rgb(170, 178, 178);
		height: 80px;
		font-size: large;
		border-radius: 10px;
		color: black;
	}

	.form-input-div {
		margin-bottom: 20px;
	}

	.delete-button-container {
		margin-top: 100px;
	}

	.delete-button-container button {
		border: none;
		font-weight: 800;
	}

	/* loading spin after clicked button */
	/* 1 class for <span> inside <button> which is .btn-text and 2 class for <button> which are .login-btn and .btn--loading (must use --loading) */
	/* Use .login-btn to set relative position only, to control spin position later */
	/* Use .btn-text to set the content (such as LOG IN ) hidden only when .btn--loading class is added */
	/* Main thing is to construct .btn--loading (with ::after pseudo ) and keyframes together. By default this class is not inside <button>, add in only when clicked button. When add inside, hide the text in .btn-text. Rmb to remove it when loading is done. 
	*/
	.login-btn {
		position: relative;
	}
	.btn--loading .btn-text {
		visibility: hidden;
		opacity: 0;
	}
	.btn--loading::after {
		content: '';
		position: absolute;
		width: 25px;
		height: 25px;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		margin: auto;
		border: 4px solid transparent;
		border-top-color: rgb(87, 92, 90);
		border-radius: 50%;
		animation: spin 1s ease infinite;
	}
	@keyframes spin {
		from {
			transform: rotate(0turn);
		}
		to {
			transform: rotate(1turn);
		}
	}
</style>
