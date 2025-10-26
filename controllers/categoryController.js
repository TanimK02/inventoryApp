import pool from '../db/pool.js';

export const getCategory = async (id) => {
    const { rows } = await pool.query("SELECT * FROM categories WHERE id=$1", [id]);
    return rows[0];
}
export const getAllCategories = async () => {
    const { rows } = await pool.query("SELECT * FROM categories");
    return rows;
}
export const createCategory = async (name) => {
    await pool.query("INSERT INTO categories (name) VALUES ($1)", [name]);
}
export const dropCategory = async (id) => {
    await pool.query("DELETE FROM categories WHERE id=$1", [id]);
}
export const updateCategory = async (name, id) => {
    await pool.query("UPDATE categories SET name=$1 WHERE id=$2", [name, id]);
}
