export default function Genres() {
  const genresList = [
    {
      genre: "Hip-Hop",
    },
    {
      genre: "Pop",
    },
    {
      genre: "Phonk",
    },
    {
      genre: "Relax",
    },
    {
      genre: "Party",
    },
    {
      genre: "Jazz",
    },
  ];
  return (
    <section className="genres">
      {genresList.map((item) => (
        <div className="genre" key={item.genre}>
          <span className="small-header-white">{item.genre}</span>
        </div>
      ))}
    </section>
  );
}
