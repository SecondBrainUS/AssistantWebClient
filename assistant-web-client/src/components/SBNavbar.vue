<template>
  <nav class="navbar">
    <div class="navbar-left">
      <img src="./assets/logo.svg" alt="Logo" class="logo" />
      <h1 class="title">My Application</h1>
    </div>
    <div class="navbar-right">
      <router-link to="/home" class="nav-link">Home</router-link>
      <router-link to="/about" class="nav-link">About</router-link>
      <router-link to="/contact" class="nav-link">Contact</router-link>
      <div class="profile">
        <img src="./assets/profile.jpg" alt="Profile" class="profile-icon" />
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'SBNavbar',
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em;
  background-color: #333;
  color: #fff;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
  margin-right: 1em;
}

.title {
  font-size: 1.5em;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.nav-link {
  margin: 0 1em;
  color: #fff;
  text-decoration: none;
}

.nav-link:hover {
  text-decoration: underline;
}

.profile {
  margin-left: 1em;
}

.profile-icon {
  height: 40px;
  width: 40px;
  border-radius: 50%;
}
</style>
