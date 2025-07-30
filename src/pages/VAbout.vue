<template>
  <section class="about">
    <article class="description">
      <p>
        Bonjour!
      </p>
      <br />
      <br />
      <p>
        I'm a french composer <span class="pronouns">(they/them)</span> who just want to compose cool music to listen to!
      </p>
      <br />
      <p>
        I thrive to learn and to create, so if you are interested, let's share this adventure along the way you want:
      </p>
    </article>

    <div class="socials">
      <a
        href="#"
        class="socials-item"
        title="twitch"
        style="--accent-color: #9146FF;"
      >
        <iconify-icon
          icon="mdi:twitch"
          title="playlist"
        />
        <span class="title">twitch</span>
      </a>

      <a
        href="#"
        class="socials-item"
        title="instagram"
        style="--accent-color: #fcaf45;"
      >
        <iconify-icon
          icon="mdi:instagram"
          title="playlist"
        />
        <span class="title">instagram</span>
      </a>

      <a
        href="#"
        class="socials-item"
        title="youtube"
        style="--accent-color: #ff0000;"
      >
        <iconify-icon
          icon="mdi:youtube"
          title="playlist"
        />
        <span class="title">youtube</span>
      </a>

      <a
        href="#"
        class="socials-item"
        title="fiverr"
        style="--accent-color: #1dbf73;"
      >
        <iconify-icon
          icon="jam:fiverr-circle"
          title="playlist"
        />
        <span class="title">fiverr</span>
      </a>
    </div>
  </section>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
@keyframes --rainbow {
  to { background-position: -200% 0 }
}

.about {
  font-size: 1.2rem;
  text-align: center;

  .description {
    backdrop-filter: blur(0.5rem);

    .pronouns {
      font-style: italic;
      color: transparent;
      background-color: #888;
      background-clip: text;
      margin-left: -0.1rem;
      padding-right: 0.1rem;

      &:hover {
        background-image: linear-gradient(135deg,
          rgb(255,0,0) 0%,
          rgb(255,154,0) 10%,
          rgb(208,222,33) 20%,
          rgb(79,220,74) 30%,
          rgb(63,218,216) 40%,
          rgb(47,201,226) 50%,
          rgb(28,127,238) 60%,
          rgb(95,21,242) 70%,
          rgb(186,12,248) 80%,
          rgb(251,7,217) 90%,
          rgb(255,0,0) 100%);
        background-position: 0 0;
        background-size: 200% 100%;
        animation: --rainbow 2s linear infinite;
      }
    }
  }

  .socials {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 1rem;

    .socials-item {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem 1rem;
      border-radius: 0.2rem;
      backdrop-filter: blur(0.5rem);

      iconify-icon {
        font-size: 2rem;
        width: 2rem;
      }

      .title {
        text-transform: capitalize;
      }
    }
  }
}
</style>
