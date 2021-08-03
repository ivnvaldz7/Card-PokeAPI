document.addEventListener('DOMContentLoaded', ()=>{
    const random = getRandomInt(1,151)
    fetchData(random)
})

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  const fetchData = async (id)=>{
      try {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
          const data = await res.json()
          console.log(data)
          const pokemon = {
              image: data.sprites.other.dream_world.front_default,
              name: data.name,
              hp: data.stats[0].base_stat,
              experience: data.base_experience,
              attack: data.stats[1].base_stat,
              defense: data.stats[2].base_stat, 
              special: data.stats[3].base_stat
            }

          drawCard(pokemon)
      } catch (error) {
          console.log(error)
      }
  }

const drawCard = (pokemon)=>{
    const flex = document.querySelector('.flex')
    const template = document.querySelector('#template-card').content
    const clone = template.cloneNode(true)
    const fragment = document.createDocumentFragment() 
    
    clone.querySelector('.card-body__img').setAttribute('src', pokemon.image)
    clone.querySelector('.card-body__title').innerHTML = `${pokemon.name} <span>${pokemon.hp}</span>`
    clone.querySelector('.card-body__text').textContent =  `${pokemon.experience} Exp`
    clone.querySelectorAll('.card-footer__social h3')[0].textContent = pokemon.attack
    clone.querySelectorAll('.card-footer__social h3')[1].textContent = pokemon.special
    clone.querySelectorAll('.card-footer__social h3')[2].textContent = pokemon.defense
    
    fragment.appendChild(clone)
    flex.appendChild(fragment)
}