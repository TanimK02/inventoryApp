import pool from "../db/pool.js"


export const getItem = async (id) => {
    const { rows } = await pool.query(`SELECT items.*, c_first.name AS cat_name
         FROM items
         LEFT JOIN categories c_first ON c_first.id = items.first_category
          WHERE items.id=$1;`, [id]);
    return rows[0];
}
export const getAllItems = async (page = 1) => {
    const offset = (page - 1) * 10;
    const { rows } = await pool.query(`SELECT items.*, c_first.name AS cat_name FROM items
         LEFT JOIN categories c_first ON c_first.id = items.first_category
         LIMIT 10 OFFSET ${offset};`);
    return rows;
}
export const searchByCat = async (catIds, page) => {
    const offset = (page - 1) * 10;
    if (!Array.isArray(catIds) || catIds.length === 0) return [];
    const valuesPlaceholders = catIds.map((_, i) => `$${i + 1}`).join(', ');
    const { rows } = await pool.query(
        `SELECT items.*, c_first.name AS cat_name
         FROM items
         LEFT JOIN categories c_first ON c_first.id = items.first_category
         WHERE items.id IN (
           SELECT item_id FROM item_category WHERE category_id IN (${valuesPlaceholders})
           GROUP BY item_id
        HAVING COUNT(DISTINCT category_id) = $${catIds.length + 1}
         )
           LIMIT 10 OFFSET ${offset}`, [...catIds, catIds.length]);
    return rows;
}
export const createItem = async (name, description, price, img, catIds) => {
    const { rows } = await pool.query(`INSERT INTO items (name, description, price, img, first_category)
             VALUES ($1, $2, $3, $4, $5) RETURNING id
            `,
        [name, description, price, img, catIds[0]]
    );
    const id = rows[0].id;
    const valuesPlaceholders = catIds
        .map((_, index) => `($1, $${index + 2})`)
        .join(', ');
    const params = [id, ...catIds];
    await pool.query(`INSERT INTO item_category (item_id, category_id)
            VALUES  ${valuesPlaceholders}`, params);
}
export const dropItem = async (id) => {
    await pool.query("DELETE FROM items WHERE id=$1", [id]);
}
export const updateItem = async (name, description, price, img, catIds, id) => {
    await pool.query(`UPDATE ITEMS
            SET name = $1,
            description = $2,
            price = $3,
            img = $4,
            first_category = $6,
            WHERE id = $5
            `, [name, description, price, img, id, catIds[0]]);
    await pool.query("DELETE FROM item_category WHERE item_id = $1", [id]);
    const valuesPlaceholders = catIds
        .map((_, index) => `($1, $${index + 2})`)
        .join(', ');
    const params = [id, ...catIds];
    await pool.query(`INSERT INTO item_category (item_id, category_id)
            VALUES  ${valuesPlaceholders}`, params);

}

